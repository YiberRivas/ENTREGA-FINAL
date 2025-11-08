import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Form, Button, Spinner, Alert } from "react-bootstrap";
import Swal from "sweetalert2";
import api from "../../api/axiosConfig";
import AdminSidebar from "./AdminSidebar";

const Agendar = () => {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  
  // Datos del formulario
  const [formData, setFormData] = useState({
    persona_id: "",
    servicio_id: "",
    fecha: "",
    hora: "",
    observaciones: "",
  });

  // Listas desde el backend
  const [personas, setPersonas] = useState([]);
  const [servicios, setServicios] = useState([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  // 🔹 Cargar personas y servicios desde el backend
  const cargarDatos = async () => {
    try {
      setLoadingData(true);
      const [resPersonas, resServicios] = await Promise.all([
        api.get("/personas/"),
        api.get("/servicios/"),
      ]);

      setPersonas(resPersonas.data);
      setServicios(resServicios.data);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      Swal.fire({
        icon: "error",
        title: "Error al cargar datos",
        text: "No se pudieron cargar personas o servicios",
        confirmButtonColor: "#dc3545",
      });
    } finally {
      setLoadingData(false);
    }
  };

  // 🔹 Manejar cambios en el formulario
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // 🔹 Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!formData.persona_id || !formData.servicio_id || !formData.fecha || !formData.hora) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Por favor completa todos los campos obligatorios",
        confirmButtonColor: "#ffc107",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/agendamientos/", {
        persona_id: parseInt(formData.persona_id),
        servicio_id: parseInt(formData.servicio_id),
        fecha: formData.fecha,
        hora: formData.hora,
        observaciones: formData.observaciones || null,
      });

      Swal.fire({
        icon: "success",
        title: "¡Agendamiento creado!",
        text: "El servicio ha sido agendado correctamente",
        confirmButtonColor: "#28a745",
        timer: 2000,
        timerProgressBar: true,
      });

      // Limpiar formulario
      setFormData({
        persona_id: "",
        servicio_id: "",
        fecha: "",
        hora: "",
        observaciones: "",
      });
    } catch (error) {
      console.error("Error al crear agendamiento:", error);
      Swal.fire({
        icon: "error",
        title: "Error al agendar",
        text: error.response?.data?.detail || "No se pudo crear el agendamiento",
        confirmButtonColor: "#dc3545",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="d-flex" style={{ minHeight: "100vh" }}>
        <AdminSidebar />
        <div className="flex-grow-1 d-flex flex-column justify-content-center align-items-center">
          <Spinner animation="border" variant="info" style={{ width: "3rem", height: "3rem" }} />
          <p className="mt-3 text-muted">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <AdminSidebar />

      <div className="flex-grow-1 p-4" style={{ background: "#f8f9fa" }}>
        <Container>
          <h4 className="mb-4 text-info fw-bold">
            <i className="fas fa-calendar-plus me-2"></i> Agendar Servicio
          </h4>

          <Row className="justify-content-center">
            <Col lg={8}>
              <Card className="shadow-sm border-0">
                <Card.Body className="p-4">
                  <Form onSubmit={handleSubmit}>
                    {/* Seleccionar Cliente */}
                    {/* Seleccionar Cliente */}
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">
                      <i className="fas fa-user me-2 text-primary"></i>
                      Cliente *
                    </Form.Label>
                    <Form.Select
                      name="persona_id"
                      value={formData.persona_id}
                      onChange={handleChange}
                      required
                    >
                      <option value="">-- Selecciona un cliente --</option>
                      {personas.map((persona) => (
                        <option key={persona.id_persona} value={persona.id_persona}>
                          {persona.nombres} {persona.apellidos} - {persona.correo}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                    {/* Seleccionar Servicio */}
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">
                      <i className="fas fa-cogs me-2 text-success"></i>
                      Servicio *
                    </Form.Label>
                    <Form.Select
                      name="servicio_id"
                      value={formData.servicio_id}
                      onChange={handleChange}
                      required
                    >
                      <option value="">-- Selecciona un servicio --</option>
                      {servicios.map((servicio) => (
                        <option key={servicio.id_servicio} value={servicio.id_servicio}>
                          {servicio.nombre_servicio} - ${servicio.precio_base} ({servicio.duracion_minutos} min)
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                    {/* Fecha y Hora */}
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold">
                            <i className="fas fa-calendar me-2 text-warning"></i>
                            Fecha *
                          </Form.Label>
                          <Form.Control
                            type="date"
                            name="fecha"
                            value={formData.fecha}
                            onChange={handleChange}
                            min={new Date().toISOString().split("T")[0]}
                            required
                          />
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold">
                            <i className="fas fa-clock me-2 text-info"></i>
                            Hora *
                          </Form.Label>
                          <Form.Control
                            type="time"
                            name="hora"
                            value={formData.hora}
                            onChange={handleChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    {/* Observaciones */}
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-bold">
                        <i className="fas fa-comment me-2 text-secondary"></i>
                        Observaciones (Opcional)
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="observaciones"
                        value={formData.observaciones}
                        onChange={handleChange}
                        placeholder="Escribe observaciones adicionales aquí..."
                      />
                    </Form.Group>

                    {/* Mostrar datos seleccionados */}
                    {formData.servicio_id && (
                      <Alert variant="info">
                        <strong>Resumen:</strong>
                        <ul className="mb-0 mt-2">
                          <li>
                            <strong>Cliente:</strong>{" "}
                            {personas.find((p) => p.id_persona === parseInt(formData.persona_id))?.nombres || "N/A"}
                          </li>
                          <li>
                            <strong>Servicio:</strong>{" "}
                            {servicios.find((s) => s.id_servicio === parseInt(formData.servicio_id))?.nombre_servicio || "N/A"}
                          </li>
                          <li>
                            <strong>Fecha:</strong> {formData.fecha || "N/A"}
                          </li>
                          <li>
                            <strong>Hora:</strong> {formData.hora || "N/A"}
                          </li>
                        </ul>
                      </Alert>
                    )}

                    {/* Botones */}
                    <div className="d-flex justify-content-end gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => setFormData({
                          persona_id: "",
                          servicio_id: "",
                          fecha: "",
                          hora: "",
                          observaciones: "",
                        })}
                      >
                        <i className="fas fa-times me-2"></i>
                        Limpiar
                      </Button>

                      <Button
                        variant="info"
                        type="submit"
                        disabled={loading}
                        className="text-white"
                      >
                        {loading ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Agendando...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-check me-2"></i>
                            Agendar Servicio
                          </>
                        )}
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default Agendar;