import React, { useEffect, useState } from "react";
import { Container, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";
import api from "../../api/axiosConfig";
import AgendamientosTable from "../../componentes/admin/AgendamientosTable"; // ajusta la ruta si es necesario

const AgendamientosPage = () => {
  const [agendamientos, setAgendamientos] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Cargar los agendamientos al iniciar
  useEffect(() => {
    const fetchAgendamientos = async () => {
      try {
        const res = await api.get("/agendamientos/");
        console.log("✅ Agendamientos cargados:", res.data);
        setAgendamientos(res.data);
      } catch (error) {
        console.error("❌ Error al obtener agendamientos:", error);
        Swal.fire({
          icon: "error",
          title: "Error al cargar datos",
          text:
            error.response?.data?.detail ||
            "No se pudieron obtener los agendamientos",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAgendamientos();
  }, []);

  // 🔹 Acciones de la tabla
  const handleView = (row) => {
    Swal.fire("Detalles del Agendamiento", JSON.stringify(row, null, 2), "info");
  };

  const handleEdit = (row) => {
    Swal.fire("Editar", `Editar agendamiento #${row.id}`, "warning");
  };

  const handleDelete = async (row) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar agendamiento?",
      text: `Se eliminará el agendamiento #${row.id}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (confirm.isConfirmed) {
      try {
        await api.delete(`/agendamientos/${row.id}`);
        setAgendamientos((prev) =>
          prev.filter((a) => a.id !== row.id)
        );
        Swal.fire("Eliminado", "El agendamiento fue eliminado.", "success");
      } catch (error) {
        console.error("Error al eliminar:", error);
        Swal.fire("Error", "No se pudo eliminar el agendamiento.", "error");
      }
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="info" />
        <p className="ms-2 text-muted">Cargando agendamientos...</p>
      </div>
    );
  }

  return (
    <Container fluid className="p-4">
      <h3 className="mb-4">
        <i className="fas fa-calendar-check me-2 text-info"></i>
        Agendamientos
      </h3>

      <AgendamientosTable
        data={agendamientos.map((a) => ({
          id: a.id_agendamiento,
          cliente: `${a.persona?.nombres || ""} ${a.persona?.apellidos || ""}`,
          servicio: a.servicio?.nombre_servicio || "Desconocido",
          fecha: a.fecha,
          estado: a.estado,
        }))}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </Container>
  );
};

export default AgendamientosPage;
