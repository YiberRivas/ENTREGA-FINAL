import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./paginas/Login";
import Registro from "./paginas/Registro";
import Inicio from "./paginas/Inicio";
import RutaPrivada from "./componentes/RutaPrivada";

// Layout y páginas del panel administrativo
import AdminLayout from "./componentes/admin/AdminLayout";
import AdminInicio from "./componentes/admin/AdminDashboard";
import Usuarios from "./componentes/admin/Usuarios";
import Servicios from "./componentes/admin/Servicios";
import Agendar from "./componentes/admin/Agendar";
import Pagos from "./componentes/admin/Pagos";
import Facturas from "./componentes/admin/Facturas";
import AgendamientosPage from "./componentes/admin/AgendamientosPage";

// Layout y páginas del panel de cliente
import ClienteLayout from "./componentes/client/ClienteLayout";
import ClienteInicio from "./componentes/client/ClienteInicio";
import ClientePerfil from "./componentes/client/ClientePerfil";
import ClienteServicios from "./componentes/client/ClienteServicios";
import ClienteHistorial from "./componentes/client/ClienteHistorial";
import CrearAgendamiento from "./componentes/client/CrearAgendamiento";
import MisAgendamientosCliente from "./componentes/client/MisAgendamientosCliente"; // Componente clave

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🌐 PÚBLICAS */}
        <Route path="/" element={<Inicio />} />
        <Route path="/inicio" element={<Inicio />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />

        {/* 🔐 PRIVADAS ADMIN */}
        <Route
          path="/admin"
          element={
            <RutaPrivada rol="administrador">
              <AdminLayout />
            </RutaPrivada>
          }
        >
          <Route index element={<Navigate to="inicio" replace />} />
          <Route path="inicio" element={<AdminInicio />} />
          <Route path="dashboard" element={<AdminInicio />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="servicios" element={<Servicios />} />
          <Route path="agendar" element={<Agendar />} />
          <Route path="pagos" element={<Pagos />} />
          <Route path="facturas" element={<Facturas />} />
          <Route path="agendamientos" element={<AgendamientosPage />} />
          
          <Route path="resumen" element={<AdminInicio />} />
          <Route path="estadisticas" element={<AdminInicio />} />
        </Route>

        {/* 👤 PRIVADAS CLIENTE */}
        <Route
          path="/cliente"
          element={
            <RutaPrivada rol="cliente">
              <ClienteLayout />
            </RutaPrivada>
          }
        >
          <Route index element={<Navigate to="inicio" replace />} />
          <Route path="inicio" element={<ClienteInicio />} />
          <Route path="perfil" element={<ClientePerfil />} />
          
          {/* Opción para ver el catálogo y luego Agendar */}
          <Route path="servicios" element={<ClienteServicios />} /> 

          {/* Formulario para AGENDAR una nueva cita */}
          <Route path="agendar" element={<CrearAgendamiento />} /> 
          
          {/* Listado de servicios activos (Cancelar/Finalizar) */}
          <Route path="mis-servicios" element={<MisAgendamientosCliente />} /> 
          
          {/* Historial de servicios finalizados/cancelados */}
          <Route path="historial" element={<ClienteHistorial />} />
          
          <Route path="dashboard" element={<ClienteInicio />} />
        </Route>

        {/* 📱 RUTAS ESPECIALES */}
        <Route path="/soporte" element={<Inicio />} />
        <Route path="/contacto" element={<Inicio />} />
        <Route path="/acerca-de" element={<Inicio />} />
        <Route path="/terminos" element={<Inicio />} />
        <Route path="/privacidad" element={<Inicio />} />

        {/* ❌ Cualquier otra ruta - Redirección inteligente */}
        <Route path="*" element={<RutaNoEncontrada />} />
      </Routes>
    </BrowserRouter>
  );
}

// Componente para rutas no encontradas
function RutaNoEncontrada() {
  // Usamos sessionStorage si el token es un JWT o si es un token de sesión
  // Si estás usando Firebase Auth, usa getAuth() para chequear el estado de autenticación.
  const token = localStorage.getItem("token");
  const usuario = localStorage.getItem("usuario");
  
  if (token && usuario) {
    const userData = JSON.parse(usuario);
    if (userData.rol === 'administrador') {
      return <Navigate to="/admin/inicio" replace />;
    } else {
      return <Navigate to="/cliente/inicio" replace />;
    }
  }
  
  return <Navigate to="/" replace />;
}

export default App;