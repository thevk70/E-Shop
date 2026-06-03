import express from "express";

const userRouter = express.Router();

import {
  fetchUsers,
  login,
  signup,
  updateUser,
  fetchSession,
  updateUserProfile,
  verify,
} from "./users.controller.js";

import {
  AdminAccessMiddleware,
  UserAccessMiddleware,
} from "../middleware/auth.middleware.js";

// Admin routes
userRouter.get("/users", AdminAccessMiddleware, fetchUsers);
userRouter.put("/users/:id", AdminAccessMiddleware, updateUser);

// User routes
userRouter.get("/session", UserAccessMiddleware, fetchSession);
userRouter.put("/update", UserAccessMiddleware, updateUserProfile);

// Auth routes
userRouter.post("/login", login);
userRouter.post("/signup", signup);
userRouter.post("/verify", verify);

export default userRouter;
