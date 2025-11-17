import { Navigate, Outlet } from "react-router-dom";
// import Swal from "sweetalert2"; // ❌ REMOVIDO: Evita que bloquee el renderizado y rompa el contexto de React Router

/**
 * Componente que protege rutas basándose en la existencia del token y el rol del usuario.
 * @param {string} rol - El rol requerido para acceder (ej: 'administrador', 'cliente').
 * @param {React.ReactNode} children - Componente a renderizar si el acceso es autorizado.
 */
export default function RutaPrivada({ rol, children }) {
  const token = localStorage.getItem("token");

  // ⚠️ 1. Sin sesión (Redirección al Login)
  if (!token) {
    // Si la sesión ha expirado, redirigimos inmediatamente.
    // La notificación de "Sesión expirada" debe manejarse en el componente de Login
    // o un componente de notificación global para evitar romper el renderizado.
    return <Navigate to="/login" replace />;
  }

  // ⚠️ 2. Verificación de rol (si se especificó un rol)
  if (rol) {
    try {
      const usuarioData = localStorage.getItem("usuario");
      
      if (!usuarioData) {
        console.warn("⚠️ No hay datos de usuario. Limpiando token y redirigiendo a /login.");
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        return <Navigate to="/login" replace />;
      }

      const usuario = JSON.parse(usuarioData);
      console.log("🔐 Verificando acceso - Rol requerido:", rol);

      // Normalizar roles para comparación
      const rolUsuario = (usuario?.rol || "").toLowerCase().trim();
      const rolRequerido = rol.toLowerCase().trim();

      if (rolUsuario !== rolRequerido) {
        console.warn(
          `❌ Acceso denegado. Se requiere rol: ${rolRequerido}, pero el usuario tiene: ${rolUsuario}`
        );

        // **Alerta de acceso denegado eliminada para no bloquear el render.**
        
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
      console.error("❌ Error al validar rol o parsear JSON:", error);
      // Limpiar y redirigir al login
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      
      // **Alerta de error de sesión eliminada para no bloquear el render.**
      
      return <Navigate to="/login" replace />;
    }
  }

  // ✅ 3. Si todo bien, renderiza contenido
  // El uso de 'children' es para rutas con Layout (ej: /cliente), y 'Outlet' para rutas anidadas.
  return children ? children : <Outlet />;
}