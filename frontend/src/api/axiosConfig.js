import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

console.log("🌐 API URL =", BASE_URL);

const api = axios.create({
  baseURL: BASE_URL || "http://127.0.0.1:8000",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ============================
// ⬆⬆ INTERCEPTOR DE REQUEST
// ============================
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

// ============================
// ⬇⬇ INTERCEPTOR DE RESPUESTA
// ============================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el token expiró
    if (error.response?.status === 401) {
      console.warn("⚠ Token expirado o inválido");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
