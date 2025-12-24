import axios from "axios";
import Cookies from "js-cookie";
import { API_URL } from "../config/config";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

// 🔐 Attach token automatically
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ❌ Optional: global response handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove("accessToken");
      window.location.href = "/signin";
    }
    return Promise.reject(error);
  }
);
