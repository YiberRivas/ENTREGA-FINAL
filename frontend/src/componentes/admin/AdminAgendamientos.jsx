import React, { useEffect, useState } from "react";
import { Container, Spinner, Button, Table } from "react-bootstrap";
import Swal from "sweetalert2";
import api from "../../api/axiosConfig";

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
      setAgendamientos(res.data || []);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudieron cargar los agendamientos", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleIniciar = async (id) => {
    try {
      const res = await api.post(`/agendamientos/iniciar/${id}`);
      Swal.fire("Iniciado", res.data.message, "success");
      cargarAgendamientos();
    } catch (error) {
      console.error(error);
      Swal.fire("Error", error.response?.data?.detail || "No se pudo iniciar", "error");
    }
  };

  const handleFinalizar = async (id) => {
    const { value: confirm } = await Swal.fire({
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
    if (confirm === undefined) return;

    try {
      // Si confirm === "1" -> pasar forma_pago_id = 1 (Efectivo) como ejemplo
      const body = {};
      if (confirm === "1") body.forma_pago_id = 1;
      const res = await api.post("/agendamientos/finalizar", {
        agendamiento_id: id,
        observaciones: "",
        calificacion: null,
        ...body
      });
      Swal.fire("Finalizado", "Factura generada: " + JSON.stringify(res.data.factura), "success");
      cargarAgendamientos();
    } catch (error) {
      console.error(error);
      Swal.fire("Error", error.response?.data?.detail || "No se pudo finalizar", "error");
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
    <Container fluid>
      <h3 className="mb-3">Agendamientos</h3>
      <Table hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Servicio</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Inicio real</th>
            <th>Fin real</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {agendamientos.map((a) => (
            <tr key={a.id}>
              <td>#{a.id}</td>
              <td>{a.cliente}</td>
              <td>{a.servicio}</td>
              <td>{a.fecha}</td>
              <td>{a.estado}</td>
              <td>{a.hora_inicio ? a.hora_inicio : "-"}</td>
              <td>{a.hora_fin ? a.hora_fin : "-"}</td>
              <td>
                {a.estado !== "en_proceso" && (
                  <Button size="sm" variant="success" onClick={() => handleIniciar(a.id)} className="me-2">
                    Iniciar
                  </Button>
                )}
                {a.estado !== "finalizado" && (
                  <Button size="sm" variant="danger" onClick={() => handleFinalizar(a.id)}>
                    Finalizar
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}
