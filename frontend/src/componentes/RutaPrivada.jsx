import { Navigate } from "react-router-dom";
<<<<<<< HEAD
export default function RutaPrivada({ children }) {
  const token = localStorage.getItem("token");
=======

export default function RutaPrivada({ children }) {
  const token = localStorage.getItem("token");

>>>>>>> 99875aa0c7e4d1ba439d7cb0423cfe923082821c
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}