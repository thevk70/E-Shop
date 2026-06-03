import express from "express";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "./notification.controller.js";
import {
  UserAccessMiddleware,
  AdminAccessMiddleware,
} from "../middleware/auth.middleware.js";

const router = express.Router();

// user notifications
router.get("/", UserAccessMiddleware, getNotifications);
router.patch("/:id/read", UserAccessMiddleware, markNotificationRead);
router.patch("/read-all", UserAccessMiddleware, markAllNotificationsRead);

// admin notifications
router.get("/notifications", AdminAccessMiddleware, getNotifications);
router.patch(
  "/notifications/:id/read",
  AdminAccessMiddleware,
  markNotificationRead,
);
router.patch(
  "/notifications/read-all",
  AdminAccessMiddleware,
  markAllNotificationsRead,
);

export default router;
