// src/componentes/RutaPrivada.jsx
import { Navigate } from "react-router-dom";

// Componente para proteger rutas
export default function RutaPrivada({ children }) {
  const token = localStorage.getItem("token");

  // Si no hay token, redirige al login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Si hay token, deja entrar al componente
  return children;
}
