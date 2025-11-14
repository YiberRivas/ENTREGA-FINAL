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
import ClientePerfil from "./componentes/client/ClientePerfil";
/* import ClienteAgendamientos from "./componentes/client/ClienteAgendamientos"; */
import ClienteServicios from "./componentes/client/ClienteServicios";
import ClienteHistorial from "./componentes/client/ClienteHistorial";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🌐 PÚBLICAS */}
        <Route path="/" element={<Inicio />} />
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
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="servicios" element={<Servicios />} />
          <Route path="agendar" element={<Agendar />} />
          <Route path="pagos" element={<Pagos />} />
          <Route path="facturas" element={<Facturas />} />
          <Route path="agendamientos" element={<AgendamientosPage />} />
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
          <Route index element={<Navigate to="perfil" replace />} />
          <Route path="perfil" element={<ClientePerfil />} />
          <Route path="servicios" element={<ClienteServicios />} />
          {/* <Route path="agendamientos" element={<ClienteAgendamientos />} /> */}
          <Route path="historial" element={<ClienteHistorial />} />
        </Route>

        {/* ❌ Cualquier otra ruta */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;