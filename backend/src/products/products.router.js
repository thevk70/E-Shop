import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  fetchProductBySlug,
  fetchProducts,
  updateProduct,
} from "./products.controller.js";

import { AdminAccessMiddleware } from "../middleware/auth.middleware.js";

const productRouter = Router();

// Public routes
productRouter.get("/", fetchProducts);
productRouter.get("/:slug", fetchProductBySlug);

// Admin routes
productRouter.post("/", AdminAccessMiddleware, createProduct);
productRouter.put("/:id", AdminAccessMiddleware, updateProduct);
productRouter.delete("/:id", AdminAccessMiddleware, deleteProduct);

export default productRouter;
