import axios from "axios";
import { useAuth } from "../zustand/useAuth";

export const httpRequest = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL,
});

httpRequest.interceptors.request.use((config) => {
  const token = useAuth.getState().user?.token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
