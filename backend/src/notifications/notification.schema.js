import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    audience: {
      type: String,
      enum: ["user", "admin", "all"],
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    type: {
      type: String,
      enum: ["order", "payment", "stock", "system"],
      default: "system",
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      default: "",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const Notification = mongoose.model("Notification", NotificationSchema);
export default Notification;
