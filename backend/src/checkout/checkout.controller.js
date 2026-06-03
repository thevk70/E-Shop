import Stripe from "stripe";
import mongoose from "mongoose";

import Product from "../products/products.schema.js";
import Order from "../orders/order.schema.js";
import Cart from "../carts/cart.schema.js";
import Notification from "../notifications/notification.schema.js";

const stripe = new Stripe(process.env.S_KEY);

function calculateAmount(items) {
  return items.reduce((total, item) => {
    const discountAmount = (item.price * item.discount) / 100;
    const finalPrice = item.price - discountAmount;
    return total + finalPrice * item.qnt;
  }, 0);
}

export const createCheckout = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const payloadProducts = req.body.products;

    if (!Array.isArray(payloadProducts) || payloadProducts.length === 0) {
      return res.status(400).json({ message: "Products required" });
    }

    const productIds = payloadProducts.map((p) => {
      if (!mongoose.Types.ObjectId.isValid(p.id)) {
        throw new Error("Invalid product id");
      }
      return new mongoose.Types.ObjectId(p.id);
    });

    const dbProducts = await Product.find({ _id: { $in: productIds } });

    if (dbProducts.length !== payloadProducts.length) {
      return res.status(400).json({ message: "Invalid product detected" });
    }

    const productsWithQuantity = dbProducts.map((product) => {
      const match = payloadProducts.find(
        (p) => p.id === product._id.toString(),
      );
      const qnt = Number(match?.qnt || 0);

      if (qnt < 1) {
        throw new Error(`Invalid quantity for ${product.title}`);
      }

      if (qnt > Number(product.stock || 0)) {
        throw new Error(
          `Only ${product.stock} item(s) left for ${product.title}`,
        );
      }

      return {
        ...product.toObject(),
        qnt,
      };
    });

    const amount = Math.round(calculateAmount(productsWithQuantity));

    const name =
      productsWithQuantity.length === 1
        ? productsWithQuantity[0].title
        : `${productsWithQuantity.length} items purchase`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: { name },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: req.user.id,
        products: JSON.stringify(payloadProducts),
      },
      success_url:
        process.env.PAYMENT_SUCCESS_URL ||
        `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:
        process.env.PAYMENT_FAILED_URL ||
        `${process.env.FRONTEND_URL}/payment-failed?session_id={CHECKOUT_SESSION_ID}`,
    });

    await Order.create({
      sessionId: session.id,
      user: req.user.id,
      products: payloadProducts,
      amount,
      paymentStatus: "unpaid",
      status: "pending",
    });

    return res.json({ paymentLink: session.url });
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Something went wrong",
    });
  }
};

export const webhook = async (req, res) => {
  let event;

  try {
    const sig = req.headers["stripe-signature"];

    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error("Signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type !== "checkout.session.completed") {
      return res.json({ received: true });
    }

    const session = event.data.object;

    if (session.payment_status !== "paid") {
      return res.json({ received: true });
    }

    const metadata = session.metadata || {};
    const products = JSON.parse(metadata.products || "[]");

    const ids = products.map((item) =>
      mongoose.Types.ObjectId.createFromHexString(item.id),
    );

    const order = await Order.findOne({ sessionId: session.id });

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.paymentStatus === "paid") {
      return res.json({ message: "Order already processed" });
    }

    const stockAlerts = [];

    for (const item of products) {
      const product = await Product.findById(item.id);

      if (!product) {
        throw new Error("Product not found");
      }

      const qnt = Number(item.qnt || 0);

      if (qnt < 1) {
        throw new Error(`Invalid quantity for ${product.title}`);
      }

      if (Number(product.stock || 0) < qnt) {
        throw new Error(`Insufficient stock for ${product.title}`);
      }

      product.stock -= qnt;
      await product.save();

      if (product.stock === 0) {
        stockAlerts.push({
          audience: "admin",
          type: "stock",
          title: "Out Of Stock",
          message: `${product.title} is now out of stock.`,
          link: "/admin/products",
        });
      } else if (product.stock <= 10) {
        stockAlerts.push({
          audience: "admin",
          type: "stock",
          title: "Low Stock Alert",
          message: `${product.title} has only ${product.stock} item(s) left.`,
          link: "/admin/products",
        });
      }
    }

    await Order.findOneAndUpdate(
      { sessionId: session.id },
      { paymentStatus: "paid" },
      { returnDocument: "after" },
    );

    await Cart.deleteMany({
      user: metadata.userId,
      product: { $in: ids },
    });

    // Notifications are best-effort: they should not break the order flow
    try {
      await Notification.create([
        {
          audience: "user",
          user: metadata.userId,
          type: "payment",
          title: "Payment Successful",
          message: "Your order has been placed successfully.",
          link: "/users/orders",
        },
        {
          audience: "admin",
          type: "order",
          title: "New Order Received",
          message: `A new order worth ₹${order.amount} has been placed.`,
          link: "/admin/orders",
        },
        ...stockAlerts,
      ]);
    } catch (notificationErr) {
      console.error("Notification creation failed:", notificationErr.message);
    }

    return res.json({ message: "Order placed" });
  } catch (err) {
    console.error("Webhook processing failed:", err.message);
    return res.status(500).json({
      message: err.message || "Webhook failed",
    });
  }
};
