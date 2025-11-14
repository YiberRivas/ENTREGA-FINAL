import { Navigate, Outlet } from "react-router-dom";
import Swal from "sweetalert2";

export default function RutaPrivada({ rol, children }) {
  const token = localStorage.getItem("token");

  // ⚠️ Sin sesión
  if (!token) {
    Swal.fire({
      icon: "warning",
      title: "Sesión expirada",
      text: "Por favor, inicia sesión nuevamente.",
      timer: 2000,
      showConfirmButton: false,
    });
    return <Navigate to="/login" replace />;
  }

  // ⚠️ Si hay restricción de rol y no coincide
  if (rol) {
    try {
      const usuarioData = localStorage.getItem("usuario");
      
      if (!usuarioData) {
        console.warn("⚠️ No hay datos de usuario en localStorage");
        localStorage.removeItem("token");
        return <Navigate to="/login" replace />;
      }

      const usuario = JSON.parse(usuarioData);
      console.log("🔐 Verificando acceso - Rol requerido:", rol);
      /* console.log("👤 Rol del usuario:", usuario?.rol); */

      // Normalizar roles para comparación
      const rolUsuario = (usuario?.rol || "").toLowerCase().trim();
      const rolRequerido = rol.toLowerCase().trim();

      if (rolUsuario !== rolRequerido) {
        console.warn(
          `❌ Acceso denegado. Se requiere rol: ${rolRequerido}, pero el usuario tiene: ${rolUsuario}`
        );

        Swal.fire({
          icon: "error",
          title: "Acceso denegado",
          text: "No tienes permisos para acceder a esta sección.",
          timer: 2000,
          showConfirmButton: false,
        });

        // Redirigir según el rol que tenga
        if (rolUsuario === "administrador" || rolUsuario.includes("admin")) {
          return <Navigate to="/admin/inicio" replace />;
        } else if (rolUsuario === "cliente") {
          return <Navigate to="/cliente/perfil" replace />;
        } else {
          return <Navigate to="/" replace />;
        }
      }

      console.log("✅ Acceso autorizado");
    } catch (error) {
      console.error("❌ Error al validar rol:", error);
      // Si hay error al parsear, limpiar y redirigir al login
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      
      Swal.fire({
        icon: "error",
        title: "Error de sesión",
        text: "Hubo un problema con tu sesión. Por favor, inicia sesión nuevamente.",
        timer: 2000,
        showConfirmButton: false,
      });
      
      return <Navigate to="/login" replace />;
    }
  }

  // ✅ Si todo bien, renderiza contenido
  return children ? children : <Outlet />;
}