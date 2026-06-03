import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    images: [String], // ✅ multiple images

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true },
);

// 🔍 Search index
ProductSchema.index({ title: "text", description: "text" });

// 💰 Final price
ProductSchema.virtual("finalPrice").get(function () {
  return this.price - this.discount;
});

const Product = mongoose.model("Product", ProductSchema);

export default Product;
