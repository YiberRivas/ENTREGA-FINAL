import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL?.trim() || "http://127.0.0.1:8000", // ⚡ ruta base por defecto
  timeout: 10000,
  headers: {
    "Content-Type": "application/json", // 👈 importante para evitar errores CORS
  },
});

// 🔒 Interceptor para token de autenticación
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
