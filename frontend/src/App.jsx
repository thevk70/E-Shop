import "animate.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { ToastContainer } from "react-toastify";

import AuthGuard from "./components/AuthGuard";
import Loader from "./components/shared/Loader";

// Public
const Login = lazy(() => import("./components/Login"));
const Signup = lazy(() => import("./components/Signup"));
const ForgotPassword = lazy(() => import("./components/ForgetPassword"));
const Home = lazy(() => import("./components/Home"));
const NotFound = lazy(() => import("./components/NotFound"));

// Layouts
const MainLayout = lazy(() => import("./components/Layout"));
const UserLayout = lazy(() => import("./components/user/UserLayout"));
const Layout = lazy(() => import("./components/admin/Layout"));

// Admin
const Dashboard = lazy(() => import("./components/admin/Dashboard"));
const Customers = lazy(() => import("./components/admin/Customers"));
const Orders = lazy(() => import("./components/admin/Orders"));
const Settings = lazy(() => import("./components/admin/Settings"));
const Products = lazy(() => import("./components/admin/Products"));

// User
const UserCarts = lazy(() => import("./components/user/UserCarts"));
const UserOrders = lazy(() => import("./components/user/UserOrders"));
const UserSettings = lazy(() => import("./components/user/UserSettings"));

const App = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
          </Route>
          <Route element={<AuthGuard />}>
            <Route path="/login" element={<Login />} />
            <Route path="/forget-password" element={<ForgotPassword />} />
            <Route path="/admin" element={<Layout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="customers" element={<Customers />} />
              <Route path="orders" element={<Orders />} />
              <Route path="settings" element={<Settings />} />
              <Route path="products" element={<Products />} />
            </Route>
            <Route path="/users" element={<UserLayout />}>
              <Route path="carts" element={<UserCarts />} />
              <Route path="orders" element={<UserOrders />} />
              <Route path="settings" element={<UserSettings />} />
            </Route>
          </Route>
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <ToastContainer />
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
