import { Router } from "express";
import {
  createCart,
  fetchCarts,
  updateCart,
  deleteCart,
} from "./carts.controller.js";

import { UserAccessMiddleware } from "../middleware/auth.middleware.js";

const cartRouter = Router();

// Add to cart
cartRouter.post("/", UserAccessMiddleware, createCart);

// Get user's cart
cartRouter.get("/", UserAccessMiddleware, fetchCarts);

// Update quantity
cartRouter.put("/:id", UserAccessMiddleware, updateCart);

// Remove item
cartRouter.delete("/:id", UserAccessMiddleware, deleteCart);

export default cartRouter;
