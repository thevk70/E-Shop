import { Outlet, Link, NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import logo from "../assets/logo.png";
import {
  BadgeIndianRupee,
  Home,
  LogIn,
  LogOut,
  Menu,
  X,
  Settings2,
  ShoppingCart,
  ClipboardList,
} from "lucide-react";
import { Avatar, Badge, Dropdown, Popconfirm, Drawer } from "antd";
import { useAuth } from "../zustand/useAuth";
import useSWR from "swr";
import { fetcher } from "../lib/fetcher";
import Error from "../components/shared/Error";
import Loader from "./shared/Loader";
import Footer from "./Footer";

const menus = [
  {
    label: "Home",
    link: "/",
    icon: <Home className="h-4 w-4" />,
  },
  {
    label: "Orders",
    link: "/users/orders",
    icon: <ClipboardList className="h-4 w-4" />,
  },
];

const Layout = () => {
  const { logout, user } = useAuth();
  const { data, error, isLoading } = useSWR(user ? "/cart" : null, fetcher, {
    revalidateOnFocus: false,
  });

  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const accountMenu = [
    {
      label: <Link to="/users/settings">Settings</Link>,
      key: "settings",
      icon: <Settings2 className="h-4 w-4" />,
    },
    {
      label: (
        <Popconfirm
          title="Do you want to logout from account?"
          onConfirm={logout}
        >
          Logout
        </Popconfirm>
      ),
      key: "logout",
      icon: <LogOut className="h-4 w-4" />,
    },
  ];

  if (error && user) {
    return <Error message={error.message} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={logo}
              alt="e-shop"
              className="h-11 w-auto object-contain"
            />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {menus.map((item) => (
              <NavLink
                key={item.link}
                to={item.link}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-zinc-900 text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}

            <NavLink
              to="/users/carts"
              className={({ isActive }) =>
                `ml-1 flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-zinc-900 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`
              }
            >
              <Badge
                count={data?.length || 0}
                size="small"
                offset={[0, 2]}
                className="!text-inherit"
              >
                <ShoppingCart className="h-4 w-4" />
              </Badge>
              Cart
            </NavLink>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <Dropdown
                menu={{ items: accountMenu }}
                placement="bottomRight"
                trigger={["click"]}
              >
                <button className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-2 py-1.5 shadow-sm transition hover:border-gray-300 hover:shadow">
                  <Avatar
                    src="https://randomuser.me/api/portraits/men/36.jpg"
                    size="default"
                  />
                  <span className="hidden text-sm font-medium text-gray-700 sm:inline">
                    Account
                  </span>
                </button>
              </Dropdown>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center rounded-2xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Link>
            )}

            <button
              onClick={() => setMobileOpen(true)}
              className="inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white p-2 text-gray-700 shadow-sm transition hover:bg-gray-100 md:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        <Drawer
          title={
            <div className="flex items-center gap-3">
              <img
                src={logo}
                alt="e-shop"
                className="h-8 w-auto object-contain"
              />
              <span className="text-base font-semibold">e-shop</span>
            </div>
          }
          placement="right"
          onClose={() => setMobileOpen(false)}
          open={mobileOpen}
          width={290}
        >
          <div className="flex flex-col gap-2">
            {menus.map((item) => (
              <NavLink
                key={item.link}
                to={item.link}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-zinc-900 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}

            <NavLink
              to="/users/carts"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-zinc-900 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              <Badge count={data?.length || 0} size="small">
                <ShoppingCart className="h-4 w-4" />
              </Badge>
              Cart
            </NavLink>

            {!user && (
              <Link
                to="/login"
                className="mt-2 inline-flex items-center justify-center rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Link>
            )}
          </div>
        </Drawer>
      </header>

      <main className="min-h-[calc(100vh-80px)]">
        {isLoading ? <Loader /> : <Outlet />}
      </main>

      <Footer />
    </div>
  );
};

export default Layout;
