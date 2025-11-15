import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

console.log("🌐 API URL =", BASE_URL); // 👈 te dice si está cargando bien

const api = axios.create({
  baseURL: BASE_URL || "http://127.0.0.1:8000",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Token (si existe)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
