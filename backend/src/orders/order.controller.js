import Order from "./order.schema.js";
import Notification from "../notifications/notification.schema.js";

// FETCH ORDERS
export const fetchOrders = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const isUser = req.user.role === "user";

    const query = isUser
      ? { user: req.user.id, paymentStatus: "paid" }
      : { paymentStatus: "paid" };

    let orders;

    if (isUser) {
      orders = await Order.find(query).populate("products.id");
    } else {
      orders = await Order.find(query)
        .populate("user", "-password")
        .populate("products.id");
    }

    return res.json(orders);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// UPDATE ORDER (ADMIN ONLY)
export const updateOrder = async (req, res) => {
  try {
    console.log("updateOrder");

    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const allowedUpdates = {};
    if (req.body.status) allowedUpdates.status = req.body.status;
    if (req.body.paymentStatus) {
      allowedUpdates.paymentStatus = req.body.paymentStatus;
    }

    const existingOrder = await Order.findById(req.params.id).populate(
      "user",
      "-password",
    );

    if (!existingOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    const order = await Order.findByIdAndUpdate(req.params.id, allowedUpdates, {
      new: true,
      runValidators: true,
    }).populate("user", "-password");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const notifications = [];

    if (req.body.status && req.body.status !== existingOrder.status) {
      notifications.push({
        audience: "user",
        user: existingOrder.user._id || existingOrder.user,
        type: "order",
        title:
          req.body.status === "dispatched"
            ? "Order Dispatched"
            : req.body.status === "cancelled"
              ? "Order Cancelled"
              : "Order Updated",
        message:
          req.body.status === "dispatched"
            ? "Your order has been dispatched."
            : req.body.status === "cancelled"
              ? "Your order has been cancelled."
              : `Your order status has been updated to ${req.body.status}.`,
        link: "/users/orders",
      });
    }

    if (
      req.body.paymentStatus &&
      req.body.paymentStatus !== existingOrder.paymentStatus
    ) {
      notifications.push({
        audience: "user",
        user: existingOrder.user._id || existingOrder.user,
        type: "payment",
        title: "Payment Status Updated",
        message: `Your order payment status is now ${req.body.paymentStatus}.`,
        link: "/users/orders",
      });
    }

    if (notifications.length > 0) {
      await Notification.create(notifications);
    }

    return res.json({
      message: "Order updated",
      order,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
