import { Router } from "express";
import { createCheckout, webhook } from "./checkout.controller.js";
import { UserAccessMiddleware } from "../middleware/auth.middleware.js";

const checkoutRouter = Router();

checkoutRouter.post("/", UserAccessMiddleware, createCheckout);
//checkoutRouter.post("/webhook", webhook);

export default checkoutRouter;
