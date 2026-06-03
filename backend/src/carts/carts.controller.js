import Cart from "./cart.schema.js";

// ADD TO CART
export const createCart = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { product } = req.body;

    if (!product) {
      return res.status(400).json({ message: "Product is required" });
    }

    const existing = await Cart.findOne({
      user: req.user.id,
      product,
    });

    // If already exists → increase qnt
    if (existing) {
      existing.qnt = (existing.qnt || 1) + 1;
      await existing.save();

      return res.json({
        message: "qnt increased",
        cart: existing,
      });
    }

    // Create new cart item
    const cart = await Cart.create({
      user: req.user.id,
      product,
      qnt: 1,
    });

    return res.status(201).json({
      message: "Product added to cart",
      cart,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// FETCH USER CART
export const fetchCarts = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const carts = await Cart.find({ user: req.user.id })
      .populate("product")
      .sort({ createdAt: -1 });

    return res.json(carts);
  } catch (err) {
    console.log(err.message);

    return res.status(500).json({ message: err.message });
  }
};

// UPDATE CART
export const updateCart = async (req, res) => {
  try {
    const { qnt } = req.body;

    if (qnt !== undefined && Number(qnt) < 1) {
      return res.status(400).json({ message: "Minimum qnt is 1" });
    }

    const cart = await Cart.findByIdAndUpdate(
      req.params.id,
      { qnt },
      { new: true },
    ).populate("product");

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    return res.json({
      message: "Cart updated",
      cart,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// DELETE CART ITEM
export const deleteCart = async (req, res) => {
  try {
    const cart = await Cart.findByIdAndDelete(req.params.id);

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    return res.json({
      message: "Product removed from cart",
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
