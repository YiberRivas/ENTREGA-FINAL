import React, { useEffect, useState } from "react";
import { Container, Spinner, Table, Button, Form, Row, Col } from "react-bootstrap";
import Swal from "sweetalert2";
import api from "../../api/axiosConfig";
import AdminSidebar from "../../componentes/admin/AdminSidebar";

const Servicios = () => {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    obtenerServicios();
  }, []);

  const obtenerServicios = async () => {
    try {
      setLoading(true);
      const response = await api.get("/servicios/");
      setServicios(response.data);
    } catch (error) {
      console.error("Error al cargar servicios:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.detail || "No se pudieron cargar los servicios.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleView = (s) => {
    Swal.fire({
      icon: "info",
      title: "Detalle del Servicio",
      html: `
        <b>ID:</b> ${s.id_servicio}<br/>
        <b>Nombre:</b> ${s.nombre_servicio}<br/>
        <b>Precio base:</b> $${(s.precio_base || 0).toLocaleString("es-CO")}<br/>
        <b>Duración:</b> ${s.duracion_minutos || 0} minutos<br/>
        <b>Descripción:</b> ${s.descripcion || "Sin descripción"}<br/>
        <b>Activo:</b> ${s.activo ? "Sí" : "No"}
      `,
      confirmButtonColor: "#17a2b8",
    });
  };

  const handleDelete = async (s) => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: "¿Eliminar servicio?",
      text: `Esto eliminará el servicio ${s.nombre_servicio}`,
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (confirm.isConfirmed) {
      try {
        await api.delete(`/servicios/${s.id_servicio}`);
        Swal.fire("Eliminado", "Servicio eliminado correctamente", "success");
        obtenerServicios();
      } catch (error) {
        Swal.fire("Error", "No se pudo eliminar el servicio", "error");
      }
    }
  };

  const serviciosFiltrados = servicios.filter((s) =>
    s.nombre_servicio?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <AdminSidebar />
      <div className="flex-grow-1 p-4" style={{ background: "#f8f9fa" }}>
        <h4 className="mb-4 text-info fw-bold">
          <i className="fas fa-cogs me-2"></i> Servicios Disponibles
        </h4>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Control
              type="text"
              placeholder="Buscar servicio..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </Col>
          <Col md="auto">
            <Button variant="info" onClick={obtenerServicios}>
              <i className="fas fa-sync-alt me-2"></i> Actualizar
            </Button>
          </Col>
        </Row>

        {loading ? (
          <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: "60vh" }}>
            <Spinner animation="border" variant="info" />
            <p className="mt-3 text-muted">Cargando servicios...</p>
          </div>
        ) : (
          <Container fluid className="bg-white shadow-sm rounded p-3">
            <Table hover responsive>
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Servicio</th>
                  <th>Precio Base</th>
                  <th>Duración</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {serviciosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center text-muted">
                      No hay servicios registrados
                    </td>
                  </tr>
                ) : (
                  serviciosFiltrados.map((s) => (
                    <tr key={s.id_servicio}>
                      <td>{s.id_servicio}</td>
                      <td>{s.nombre_servicio}</td>
                      <td>${(s.precio_base || 0).toLocaleString("es-CO")}</td>
                      <td>{s.duracion_minutos} min</td>
                      <td className="text-end">
                        <Button variant="info" size="sm" className="me-2" onClick={() => handleView(s)}>
                          <i className="fas fa-eye"></i>
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(s)}>
                          <i className="fas fa-trash"></i>
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </Container>
        )}
      </div>
    </div>
  );
};

export default Servicios;
