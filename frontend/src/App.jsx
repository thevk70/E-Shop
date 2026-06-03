import "animate.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Login from "./components/Login";
import Dashboard from "./components/admin/Dashboard";
import AuthGuard from "./components/AuthGuard";
import Layout from "./components/admin/Layout";
import Customers from "./components/admin/Customers";
import Orders from "./components/admin/Orders";
import Settings from "./components/admin/Settings";
import Products from "./components/admin/Products";
import NotFound from "./components/NotFound";
import Signup from "./components/Signup";
import Home from "./components/Home";
import UserCarts from "./components/user/UserCarts";
import UserOrders from "./components/user/UserOrders";
import UserSettings from "./components/user/UserSettings";
import UserLayout from "./components/user/UserLayout";
import MainLayout from "./components/Layout";
import ForgotPassword from "./components/ForgetPassword";

const App = () => {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
};

export default App;
