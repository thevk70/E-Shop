import { Router } from "express";

import {
  createProduct,
  deleteProduct,
  fetchProductById,
  fetchProductBySlug,
  fetchProducts,
  updateProduct,
} from "./products.controller.js";

import { AdminAccessMiddleware } from "../middleware/auth.middleware.js";

const productRouter = Router();

// PUBLIC ROUTES

// Fetch all products
productRouter.get("/", fetchProducts);

// Fetch product by MongoDB ID
productRouter.get("/id/:id", fetchProductById);

// Fetch product by slug
productRouter.get("/slug/:slug", fetchProductBySlug);

// =====================================================
// ADMIN ROUTES
// =====================================================

// Create product
productRouter.post("/", AdminAccessMiddleware, createProduct);

// Update product
productRouter.put("/:id", AdminAccessMiddleware, updateProduct);

// Delete product
productRouter.delete("/:id", AdminAccessMiddleware, deleteProduct);

export default productRouter;
