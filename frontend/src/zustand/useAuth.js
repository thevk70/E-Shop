import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "react-toastify";
import axios from "axios";
const env = import.meta.env;
axios.defaults.baseURL = import.meta.env.VITE_SERVER_URL;

export const useAuth = create(
  persist((set) => ({
    user: null,
    signup: async (values) => {
      try {
        const { data } = await axios.post("auth/signup", values);
        set({ user: data });
        toast.success("Account created start your shopping now.");
        setTimeout(() => {
          window.location.replace("/");
        }, 2000);
      } catch (err) {
        toast.error(err.response.data.message);
      }
    },
    login: async (values) => {
      try {
        const res = await axios.post("/auth/login", values);
        toast.success("Login success", { position: "top-center" });

        setTimeout(() => {
          console.log(res.data.role);
          set({ user: res.data });
          if (res.data.role === "admin")
            window.location.replace("/admin/dashboard");
          else window.location.replace("/");
        }, 2000);
      } catch (err) {
        console.log(err);
        toast.error(err.response.data.message, { position: "top-center" });
        set({ user: null });
      }
    },
    logout: () => {
      toast.success("Logout success", { position: "top-center" });
      set({ user: null });
    },
  })),
);
