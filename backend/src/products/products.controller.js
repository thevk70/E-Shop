import Product from "./products.schema.js";

// CREATE PRODUCT
export const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);

    return res.status(201).json(product);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// FETCH ALL PRODUCTS
export const fetchProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    return res.json(products);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// FETCH PRODUCT BY SLUG
export const fetchProductBySlug = async (req, res) => {
  try {
    const slug = req.params.slug;

    // convert slug → title
    const title = slug.split("-").join(" ");

    const product = await Product.findOne({
      title: new RegExp(`^${title}$`, "i"), // case-insensitive match
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json(product);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// UPDATE PRODUCT
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }, // return updated doc
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json({
      message: "Product updated",
      product,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// DELETE PRODUCT
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json({ message: "Product deleted" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
