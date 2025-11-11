import React, { useEffect, useState } from "react";
import { Container, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";
import api from "../../api/axiosConfig";
import AgendamientosTable from "../../componentes/admin/AgendamientosTable"; // Asegúrate de que esta ruta sea correcta

const AdminAgendamientos = () => {
  const [agendamientos, setAgendamientos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarAgendamientos();
  }, []);

  const cargarAgendamientos = async () => {
    try {
      const res = await api.get("/admin/agendamientos_recientes?limite=50");
      setAgendamientos(res.data || []);
    } catch (error) {
      console.error("Error al cargar agendamientos:", error);
      Swal.fire("Error", "No se pudieron cargar los agendamientos", "error");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Funciones para acciones (ver, editar, eliminar)
  const handleView = (ag) => {
    Swal.fire({
      title: "Detalles del agendamiento",
      html: `
        <b>Cliente:</b> ${ag.cliente}<br/>
        <b>Servicio:</b> ${ag.servicio}<br/>
        <b>Fecha:</b> ${ag.fecha}<br/>
        <b>Estado:</b> ${ag.estado}
      `,
      icon: "info",
      confirmButtonColor: "#17a2b8",
    });
  };

  const handleEdit = (ag) => {
    Swal.fire("Editar", `Función para editar agendamiento #${ag.id}`, "info");
  };

  const handleDelete = async (ag) => {
    const result = await Swal.fire({
      title: "¿Eliminar agendamiento?",
      text: `Se eliminará el agendamiento de ${ag.cliente}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, eliminar",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/agendamientos/${ag.id}`);
        Swal.fire("Eliminado", "El agendamiento ha sido eliminado", "success");
        cargarAgendamientos(); // recargar la lista
      } catch (error) {
        Swal.fire("Error", "No se pudo eliminar el agendamiento", "error");
      }
    }
  };

  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="info" style={{ width: "3rem", height: "3rem" }} />
        <p className="mt-3 text-muted">Cargando agendamientos...</p>
      </div>
    );
  }

  return (
    <Container fluid className="p-4" style={{ marginLeft: "250px" }}>
      <AgendamientosTable
        data={agendamientos}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </Container>
  );
};

export default AdminAgendamientos;
