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
import Agendamientos from "./componentes/admin/AgendamientosTable";
import Pagos from "./componentes/admin/Pagos";
import Agendar from "./componentes/admin/Agendar";

function App() {
  return (
    <BrowserRouter>
      <Routes>
<<<<<<< HEAD
        {/* 🌐 RUTAS PÚBLICAS */}
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/" element={<Inicio />} />

        {/* 🔐 RUTAS PRIVADAS DEL ADMIN */}
=======
        {/* Rutas públicas */}
        <Route path="/Login" element={<Login />} />
        <Route path="/Registro" element={<Registro />} />
        <Route path="/" element={<Inicio />} /> {/* o tu home sin login */}
        {/* Rutas protegidas */}
>>>>>>> 99875aa0c7e4d1ba439d7cb0423cfe923082821c
        <Route
          path="/admin"
          element={
            <RutaPrivada>
              <AdminLayout />
            </RutaPrivada>
          }
        >
          {/* Página principal del dashboard */}
          <Route index element={<Navigate to="inicio" replace />} />
          <Route path="inicio" element={<AdminInicio />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="servicios" element={<Servicios />} />
          <Route path="agendar" element={<Agendar />} />
          <Route path="pagos" element={<Pagos />} />
        </Route>

        {/* ❌ Cualquier otra ruta redirige al inicio */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
