import { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  Divider,
  Dropdown,
  Empty,
  List,
  Popconfirm,
  Spin,
  Tag,
} from "antd";
import {
  AlignRight,
  Axis3D,
  Bell,
  CheckCheck,
  LayoutDashboard,
  ListOrdered,
  LogOut,
  LogOutIcon,
  Settings,
  Settings2,
  ShoppingBag,
  ShoppingCart,
  User,
} from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";
import useSWR from "swr";
import { useAuth } from "../../zustand/useAuth";
import { fetcher } from "../../lib/fetcher";
import { httpRequest } from "../../lib/http-request";

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

const getNotificationStyle = (type) => {
  switch (type) {
    case "order":
      return {
        title: "Order",
        badge: "bg-blue-50 text-blue-700",
        icon: "bg-blue-600",
      };
    case "payment":
      return {
        title: "Payment",
        badge: "bg-emerald-50 text-emerald-700",
        icon: "bg-emerald-600",
      };
    case "stock":
      return {
        title: "Stock",
        badge: "bg-amber-50 text-amber-700",
        icon: "bg-amber-600",
      };
    case "user":
      return {
        title: "User",
        badge: "bg-purple-50 text-purple-700",
        icon: "bg-purple-600",
      };
    default:
      return {
        title: "System",
        badge: "bg-zinc-50 text-zinc-700",
        icon: "bg-zinc-900",
      };
  }
};

const AdminNotificationBell = () => {
  const { user } = useAuth();

  const {
    data,
    isLoading,
    mutate: mutateNotifications,
  } = useSWR(
    user && user.role === "admin" ? "/admin/notifications" : null,
    fetcher,
    {
      revalidateOnFocus: false,
    },
  );

  const notifications = Array.isArray(data) ? data : [];

  const unreadCount = useMemo(() => {
    return notifications.filter((item) => !item.isRead).length;
  }, [notifications]);

  const markOneRead = async (id) => {
    try {
      await httpRequest.patch(`/admin/notifications/${id}/read`);
      mutateNotifications();
    } catch (err) {
      console.log(err);
    }
  };

  const markAllRead = async () => {
    try {
      await httpRequest.patch("/admin/notifications/read-all");
      mutateNotifications();
    } catch (err) {
      console.log(err);
    }
  };

  if (!user || user.role !== "admin") return null;

  const content = (
    <div className="w-[380px] max-w-[92vw] rounded-3xl border border-gray-200 bg-white p-3 shadow-2xl">
      <div className="flex items-start justify-between gap-3 px-1 pb-2">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            Admin Notifications
          </h3>
          <p className="text-xs text-gray-500">{unreadCount} unread</p>
        </div>

        <Button
          type="text"
          size="small"
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
              const cfg = getNotificationStyle(item.type);

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
                      className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-white ${cfg.icon}`}
                    >
                      <Bell className="h-4 w-4" />
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
                          <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-500" />
                        )}
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Tag
                          className={`!m-0 !rounded-full !border-0 !px-2 !py-0.5 !text-xs ${cfg.badge}`}
                        >
                          {cfg.title}
                        </Tag>
                        <span className="text-xs text-gray-400">
                          {formatTimeAgo(item.createdAt)}
                        </span>
                      </div>

                      {item.link ? (
                        <div className="mt-2 text-xs font-medium text-zinc-900">
                          Tap to view details
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
      dropdownRender={() => content}
    >
      <button
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:bg-gray-100"
        aria-label="Open notifications"
      >
        <Badge count={unreadCount} size="small" offset={[-2, 2]}>
          <Bell className="h-5 w-5" />
        </Badge>
      </button>
    </Dropdown>
  );
};

const Layout = () => {
  const [space, setSpace] = useState(270);
  const { logout } = useAuth();
  const location = useLocation();

  const accountMenu = [
    {
      label: <Link to="/admin/dashboard">Dashboard</Link>,
      key: "dashboard",
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      label: <Link to="/admin/settings">Settings</Link>,
      key: "settings",
      icon: <Settings className="w-4 h-4" />,
    },
    {
      label: (
        <Popconfirm
          title="Do you want to logout from account ?"
          onConfirm={logout}
        >
          Logout
        </Popconfirm>
      ),
      key: "logout",
      icon: <LogOut className="w-4 h-4" />,
    },
  ];

  const menus = [
    {
      label: "Dashboard",
      href: "/admin/dashboard",
      icon: <Axis3D className="w-4 h-4" />,
    },
    {
      label: "Customer",
      href: "/admin/customers",
      icon: <User className="w-4 h-4" />,
    },
    {
      label: "Order",
      href: "/admin/orders",
      icon: <ListOrdered className="w-4 h-4" />,
    },
    {
      label: "Products",
      href: "/admin/products",
      icon: <ShoppingBag className="w-4 h-4" />,
    },
    {
      label: "Settings",
      href: "/admin/settings",
      icon: <Settings2 className="w-4 h-4" />,
    },
  ];

  const activeMenu =
    menus.find((menu) => menu.href === location.pathname) || menus[0];

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      <aside
        style={{
          width: `${space}px`,
          transition: "0.3s",
        }}
        className="fixed left-0 top-0 flex h-full flex-col justify-between overflow-hidden border-r border-slate-200 bg-white"
      >
        <div className="flex items-center justify-center gap-2 px-6 py-5.5">
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-white">
            <ShoppingCart className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-semibold">Ecommerce</h1>
        </div>

        <div className="flex flex-1 flex-col gap-1 px-6 py-6">
          {menus.map((item, index) => {
            const isActive = item.href === location.pathname;

            return (
              <Link key={index} to={item.href}>
                <button
                  className={`flex w-full items-center gap-3 rounded px-3 py-2 font-medium duration-300 ${
                    isActive
                      ? "bg-gray-200 text-gray-800"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              </Link>
            );
          })}
        </div>

        <div className="px-6 py-5">
          <Popconfirm
            title="Do you want to logout from account ?"
            onConfirm={logout}
          >
            <button className="flex w-full items-center justify-center rounded-lg bg-rose-500 py-2.5 font-medium text-white duration-200 hover:scale-[1.02] active:scale-95">
              <LogOutIcon className="h-4 w-4" />
              <span className="ml-2">Logout</span>
            </button>
          </Popconfirm>
        </div>
      </aside>

      <section
        style={{
          marginLeft: `${space}px`,
          transition: "0.3s",
        }}
      >
        <nav className="sticky top-0 left-0 z-50 flex w-full items-center justify-between bg-white px-6 py-4 shadow sm:px-12">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSpace(space === 0 ? 270 : 0)}
              className="rounded bg-gray-100 p-2 duration-300 hover:bg-gray-200 active:scale-95"
            >
              <AlignRight className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <AdminNotificationBell />

            <Dropdown menu={{ items: accountMenu }} trigger={["click"]}>
              <Avatar
                src="https://randomuser.me/api/portraits/men/36.jpg"
                size="large"
              />
            </Dropdown>
          </div>
        </nav>

        <div className="space-y-8 px-6 py-8 sm:px-12">
          <div className="flex items-center gap-3">
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
              {activeMenu?.icon}
            </button>
            <h1 className="text-3xl font-bold capitalize">
              {location.pathname.split("/").pop() || "dashboard"}
            </h1>
          </div>

          <Outlet />
        </div>
      </section>
    </div>
  );
};

export default Layout;
