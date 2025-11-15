import React, { useEffect, useState } from "react";
import { Container, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";
import api from "../../api/axiosConfig";
import AgendamientosTable from "../../componentes/admin/AgendamientosTable";

const AgendamientosPage = () => {
  const [agendamientos, setAgendamientos] = useState([]);
  const [loading, setLoading] = useState(true);

  // ============================
  // 🔹 Cargar los agendamientos
  // ============================
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

  useEffect(() => {
    fetchAgendamientos();
  }, []);

  // ============================
  // 🔹 Ver detalles
  // ============================
  const handleView = (row) => {
    Swal.fire("Detalles", JSON.stringify(row, null, 2), "info");
  };

  // ============================
  // 🔹 Editar estado
  // ============================
  const handleEdit = async (row) => {
    const { value: estado } = await Swal.fire({
      title: `Actualizar estado (#${row.id_agendamiento})`,
      input: "select",
      inputOptions: {
        pendiente: "Pendiente",
        en_progreso: "En progreso",
        finalizado: "Finalizado",
        cancelado: "Cancelado",
      },
      inputPlaceholder: "Seleccione un estado",
      showCancelButton: true,
    });

    if (!estado) return;

    try {
      await api.put(`/agendamientos/${row.id_agendamiento}/estado`, {
        estado,
      });

      Swal.fire("Actualizado", "El estado fue actualizado.", "success");
      fetchAgendamientos();
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      Swal.fire("Error", "No se pudo actualizar el estado.", "error");
    }
  };

  // ============================
  // 🔹 Eliminar agendamiento
  // ============================
  const handleDelete = async (row) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar agendamiento?",
      text: `Se eliminará el agendamiento #${row.id_agendamiento}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!confirm.isConfirmed) return;

    try {
      await api.delete(`/agendamientos/${row.id_agendamiento}`);
      Swal.fire("Eliminado", "El agendamiento fue eliminado.", "success");
      fetchAgendamientos();
    } catch (error) {
      console.error("Error al eliminar:", error);
      Swal.fire("Error", "No se pudo eliminar el agendamiento.", "error");
    }
  };

  // ============================
  // 🔹 Botón Iniciar Servicio
  // ============================
  const handleStart = async (row) => {
    try {
      await api.post(`/agendamientos/iniciar/${row.id_agendamiento}`);
      Swal.fire("Iniciado", "El servicio fue iniciado.", "success");
      fetchAgendamientos();
    } catch (error) {
      Swal.fire("Error", "No se pudo iniciar el agendamiento.", "error");
    }
  };

  // ============================
  // 🔹 Botón Finalizar Servicio
  // ============================
  const handleFinish = async (row) => {
    try {
      await api.post(`/agendamientos/finalizar`, {
        id_agendamiento: row.id_agendamiento,
      });

      Swal.fire("Finalizado", "El servicio ha finalizado.", "success");
      fetchAgendamientos();
    } catch (error) {
      Swal.fire("Error", "No se pudo finalizar el servicio.", "error");
    }
  };

  // ============================
  // Render
  // ============================
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
          id_agendamiento: a.id_agendamiento,
          cliente: `${a.persona?.nombres || ""} ${a.persona?.apellidos || ""}`,
          servicio: a.servicio?.nombre_servicio || "Desconocido",
          fecha: a.fecha,
          estado: a.estado,
        }))}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onStart={handleStart}
        onFinish={handleFinish}
      />
    </Container>
  );
};

export default AgendamientosPage;
