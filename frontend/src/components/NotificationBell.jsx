import React, { useMemo } from "react";
import useSWR from "swr";
import { Badge, Button, Divider, Dropdown, Empty, List, Spin, Tag } from "antd";
import {
  Bell,
  CheckCheck,
  CircleAlert,
  Package,
  ShoppingBag,
  Megaphone,
} from "lucide-react";
import { fetcher } from "../lib/fetcher";
import { httpRequest } from "../lib/http-request";

const getTypeConfig = (type) => {
  switch (type) {
    case "order":
      return {
        icon: <ShoppingBag className="h-4 w-4" />,
        color: "bg-blue-50 text-blue-700",
        label: "Order",
      };
    case "payment":
      return {
        icon: <CheckCheck className="h-4 w-4" />,
        color: "bg-emerald-50 text-emerald-700",
        label: "Payment",
      };
    case "stock":
      return {
        icon: <Package className="h-4 w-4" />,
        color: "bg-amber-50 text-amber-700",
        label: "Stock",
      };
    default:
      return {
        icon: <Megaphone className="h-4 w-4" />,
        color: "bg-zinc-50 text-zinc-700",
        label: "System",
      };
  }
};

const formatTimeAgo = (dateValue) => {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";

  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;

  return date.toLocaleDateString();
};

const NotificationBell = ({ user, compact = false }) => {
  const {
    data,
    isLoading,
    mutate: mutateNotifications,
  } = useSWR(user ? "/notifications" : null, fetcher, {
    revalidateOnFocus: false,
  });

  const notifications = Array.isArray(data) ? data : [];

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications],
  );

  const markOneRead = async (id) => {
    try {
      await httpRequest.patch(`/notifications/${id}/read`);
      mutateNotifications();
    } catch {
      // silently fail
    }
  };

  const markAllRead = async () => {
    try {
      await httpRequest.patch("/notifications/read-all");
      mutateNotifications();
    } catch {
      // silently fail
    }
  };

  const dropdownContent = (
    <div className="w-[360px] max-w-[90vw] rounded-3xl border border-gray-200 bg-white p-3 shadow-2xl">
      <div className="flex items-start justify-between gap-3 px-1 pb-2">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
          <p className="text-xs text-gray-500">{unreadCount} unread</p>
        </div>

        <Button
          size="small"
          type="text"
          icon={<CheckCheck className="h-4 w-4" />}
          onClick={markAllRead}
          disabled={!notifications.length}
          className="!text-gray-700"
        >
          Mark all read
        </Button>
      </div>

      <Divider className="!my-2" />

      <div className="max-h-96 overflow-y-auto pr-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spin />
          </div>
        ) : notifications.length > 0 ? (
          <List
            dataSource={notifications}
            renderItem={(item) => {
              const cfg = getTypeConfig(item.type);

              return (
                <List.Item
                  onClick={() => markOneRead(item._id)}
                  className={`mb-2 cursor-pointer rounded-2xl border px-3 py-3 transition hover:shadow-sm ${
                    item.isRead
                      ? "border-gray-200 bg-white"
                      : "border-zinc-200 bg-zinc-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${cfg.color}`}
                    >
                      {cfg.icon}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-900">
                            {item.title}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-gray-500">
                            {item.message}
                          </p>
                        </div>

                        {!item.isRead && (
                          <CircleAlert className="mt-1 h-4 w-4 shrink-0 text-blue-500" />
                        )}
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Tag className="!m-0 !rounded-full !border-0 !bg-gray-100 !px-2 !py-0.5 !text-xs !text-gray-700">
                          {cfg.label}
                        </Tag>
                        <span className="text-xs text-gray-400">
                          {formatTimeAgo(item.createdAt)}
                        </span>
                      </div>

                      {item.link ? (
                        <div className="mt-2">
                          <span className="text-xs font-medium text-zinc-900">
                            Tap to view details
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </List.Item>
              );
            }}
          />
        ) : (
          <div className="py-6">
            <Empty description="No notifications" />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Dropdown
      trigger={["click"]}
      placement="bottomRight"
      dropdownRender={() => dropdownContent}
    >
      <button
        className={`relative inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:bg-gray-100 ${
          compact ? "h-11 w-11 p-2" : "p-2"
        }`}
        aria-label="Open notifications"
      >
        <Badge count={unreadCount} size="small" offset={[-2, 2]}>
          <Bell className="h-5 w-5" />
        </Badge>
      </button>
    </Dropdown>
  );
};

export default NotificationBell;
