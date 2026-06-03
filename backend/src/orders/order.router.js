import { Router } from "express";
import { fetchOrders, updateOrder } from "./order.controller.js";
import {
  AuthAccessMiddleware,
  AdminAccessMiddleware,
} from "../middleware/auth.middleware.js";

const orderRouter = Router();

// Get orders (user/admin)
orderRouter.get("/", AuthAccessMiddleware, fetchOrders);

// Update order (admin only)
orderRouter.put("/:id", AdminAccessMiddleware, updateOrder);

export default orderRouter;
