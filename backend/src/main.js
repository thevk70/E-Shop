import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import userRouter from "./users/users.router.js";
import cartRouter from "./carts/cart.router.js";
import productRouter from "./products/products.router.js";
import orderRouter from "./orders/order.router.js";
import checkoutRouter from "./checkout/checkout.router.js";
import { webhook } from "./checkout/checkout.controller.js";
import notificationRouter from "./notifications/notification.router.js";

dotenv.config();
const env = process.env;
const app = express();

app.use(
  cors({
    origin: "*",
  }),
);

app.post(
  "/checkout/webhook",
  express.raw({ type: "application/json" }),
  webhook,
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

mongoose
  .connect(`${env.MONGO_URL}`)
  .then(() => console.log("Database connected."))
  .catch((e) => console.log("Database connection failed.", e.message));

app.listen(env.PORT, () => {
  console.log(`Server is running at Post ${env.PORT}.`);
});

app.use("/auth", userRouter);
app.use("/cart", cartRouter);
app.use("/products", productRouter);
app.use("/orders", orderRouter);
app.use("/checkout", checkoutRouter);
app.use("/admin", notificationRouter);
app.use("/notifications", notificationRouter);

app.use((req, res) => {
  res.status(404).json({ message: `${req.url} not found` });
});
