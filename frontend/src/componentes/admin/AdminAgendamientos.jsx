import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../../api/axiosConfig";
import AgendamientosTable from "../../components/admin/AgendamientosTable"; 
import ModalFinalizar from "../../components/admin/ModalFinalizar";

import { Spinner } from "react-bootstrap";

export default function AdminAgendamientos() {
  const [agendamientos, setAgendamientos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarAgendamientos();
  }, []);

  const cargarAgendamientos = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/agendamientos_recientes?limite=100");

      // ADAPTAR DATOS A TU TABLA
      const adaptados = (res.data || []).map((a) => ({
        id_agendamiento: a.id,
        cliente: a.cliente,
        servicio: a.servicio,
        fecha: a.fecha,
        estado: a.estado,
      }));

      setAgendamientos(adaptados);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudieron cargar los agendamientos", "error");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Ver
  const handleView = (row) => {
    Swal.fire({
      title: "Detalles del Agendamiento",
      html: `
        <p><b>ID:</b> ${row.id_agendamiento}</p>
        <p><b>Cliente:</b> ${row.cliente}</p>
        <p><b>Servicio:</b> ${row.servicio}</p>
        <p><b>Fecha:</b> ${row.fecha}</p>
        <p><b>Estado:</b> ${row.estado}</p>
      `,
      confirmButtonText: "Cerrar",
    });
  };

  // 🔹 Editar (opcional)
  const handleEdit = (row) => {
    Swal.fire("Editar", "Función de edición pendiente", "info");
  };

  // 🔹 Eliminar
  const handleDelete = (row) => {
    Swal.fire({
      title: "¿Eliminar agendamiento?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonText: "Cancelar",
      confirmButtonText: "Eliminar",
    }).then(async (r) => {
      if (r.isConfirmed) {
        try {
          await api.delete(`/agendamientos/${row.id_agendamiento}`);
          Swal.fire("Eliminado", "Agendamiento eliminado", "success");
          cargarAgendamientos();
        } catch (error) {
          Swal.fire(
            "Error",
            error.response?.data?.detail || "No se pudo eliminar",
            "error"
          );
        }
      }
    });
  };

  // 🔹 Iniciar
  const handleStart = async (row) => {
    try {
      const res = await api.post(`/agendamientos/iniciar/${row.id_agendamiento}`);
      Swal.fire("Iniciado", res.data.message, "success");
      cargarAgendamientos();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.detail || "No se pudo iniciar", "error");
    }
  };

  // 🔹 Finalizar
  const handleFinish = async (row) => {
    const { value } = await Swal.fire({
      title: "Finalizar servicio",
      text: "¿Deseas finalizar y generar factura?",
      input: "select",
      inputOptions: {
        0: "No pagar ahora (factura pendiente)",
        1: "Registrar pago ahora (cliente pagó en sitio)"
      },
      showCancelButton: true,
      confirmButtonText: "Aceptar",
    });

    if (value === undefined) return;

    try {
      const body = { agendamiento_id: row.id_agendamiento };
      if (value === "1") body.forma_pago_id = 1;

      const res = await api.post("/agendamientos/finalizar", body);
      Swal.fire("Finalizado", "Factura generada correctamente", "success");
      cargarAgendamientos();
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.detail || "No se pudo finalizar",
        "error"
      );
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="info" />
      </div>
    );
  }

  return (
    <div>
      <h3 className="mb-3">Agendamientos</h3>

      <AgendamientosTable
        data={agendamientos}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onStart={handleStart}
        onFinish={handleFinish}
      />
    </div>
  );
}
