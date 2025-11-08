import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import StatsCards from "./StatsCards";
import AgendamientosTable from "./AgendamientosTable";
import "../../assets/estilos/AdminDashboard.css";

/*
 AdminPage: Punto de entrada del panel administrativo.
 - Carga datos demo desde estado local (reemplazar por fetch/axios).
 - Pasa handlers a subcomponentes para acciones.
*/

const AdminPage = () => {
  // Estado global de admin: estadísticas y agendamientos (simulación)
  const [stats, setStats] = useState({
    usuarios: 158,
    lavadoras: 12,
    agendamientos: 45,
    pagos: "1.250.000",
  });

  const [agendamientos, setAgendamientos] = useState([
    { id: "#001", cliente: "María González", servicio: "Lavadora 12kg", fecha: "2025-11-02", estado: "Confirmado" },
    { id: "#002", cliente: "Carlos Pérez", servicio: "Lavadora Semiautomática", fecha: "2025-11-01", estado: "Cancelado" },
    { id: "#003", cliente: "Laura Torres", servicio: "Lavadora Automática", fecha: "2025-10-31", estado: "Pendiente" },
  ]);

  // Simular carga inicial (reemplaza por fetch)
  useEffect(() => {
    // ejemplo: fetch('/api/admin/dashboard').then(...)
  }, []);

  // Handlers para acciones de fila -> pasar a AgendamientosTable
  const handleView = (item) => {
    // abrir modal o navegar a detalle (implementar)
    alert(`Ver: ${item.id} - ${item.cliente}`);
  };

  const handleEdit = (item) => {
    // abrir modal de edición (implementar)
    alert(`Editar: ${item.id}`);
  };

  const handleDelete = (item) => {
    // confirmar y eliminar (aquí se elimina del estado local)
    if (window.confirm(`Eliminar ${item.id} - ${item.cliente}?`)) {
      setAgendamientos(prev => prev.filter(a => a.id !== item.id));
    }
  };

  return (
    <div className="admin-root d-flex">
      <AdminSidebar />
      <div className="admin-main flex-grow-1">
        <Container fluid className="p-4">
          <AdminHeader />

          <Row className="mt-3">
            <Col xs={12}>
              <StatsCards stats={stats} />
            </Col>
          </Row>

          <Row className="mt-4">
            <Col xs={12}>
              <AgendamientosTable
                data={agendamientos}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default AdminPage;
