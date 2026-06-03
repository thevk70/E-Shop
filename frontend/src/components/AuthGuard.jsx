const env = import.meta.env;
import { useEffect, useState } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../zustand/useAuth";
import axios from "axios";
import { Loader2 } from "lucide-react";
axios.defaults.baseURL = env.VITE_SERVER_URL;

const AuthGuard = () => {
  const location = useLocation();
  const [isLogin, setLogin] = useState(null);
  const [role, setRole] = useState(null);
  const { user } = useAuth();

  const checkToken = async (token) => {
    try {
      const { data } = await axios.post("/auth/verify", { token });
      setRole(data.role);
      setLogin(true);
    } catch {
      setRole(null);
      setLogin(false);
    }
  };

  useEffect(() => {
    if (user?.token) {
      checkToken(user.token);
    } else {
      setLogin(false);
    }
  }, [user]);

  //Loading
  if (isLogin === null) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-16 h-16 text-indigo-600" />
      </div>
    );
  }

  //Not logged in
  if (!isLogin) {
    if (
      location.pathname === "/login" ||
      location.pathname === "/forget-password"
    ) {
      return <Outlet />;
    }

    return <Navigate to="/login" replace />;
  }

  //Logged in

  // Prevent logged-in users from seeing login
  if (location.pathname === "/login") {
    return role === "admin" ? (
      <Navigate to="/admin/dashboard" replace />
    ) : (
      <Navigate to="/users/carts" replace />
    );
  }

  // Admin routes
  if (location.pathname.startsWith("/admin")) {
    return role === "admin" ? (
      <Outlet />
    ) : (
      <Navigate to="/users/carts" replace />
    );
  }

  // User routes
  if (location.pathname.startsWith("/user")) {
    return role === "user" ? (
      <Outlet />
    ) : (
      <Navigate to="/admin/dashboard" replace />
    );
  }

  // Default redirect
  return role === "admin" ? (
    <Navigate to="/admin/dashboard" replace />
  ) : (
    <Navigate to="/users/carts" replace />
  );
};

export default AuthGuard;
