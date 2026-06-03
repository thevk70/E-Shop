import Notification from "./notification.schema.js";

export const getNotifications = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const isAdmin = req.user.role === "admin";

    const query = isAdmin
      ? {
          $or: [{ audience: "admin" }, { audience: "all" }],
        }
      : {
          $or: [{ audience: "all" }, { audience: "user", user: req.user.id }],
        };

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    return res.json(notifications);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true },
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    return res.json(notification);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const markAllNotificationsRead = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const isAdmin = req.user.role === "admin";

    const query = isAdmin
      ? { $or: [{ audience: "admin" }, { audience: "all" }] }
      : { $or: [{ audience: "all" }, { audience: "user", user: req.user.id }] };

    await Notification.updateMany(query, { isRead: true });

    return res.json({ message: "All notifications marked as read" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
