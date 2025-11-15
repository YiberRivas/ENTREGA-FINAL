import React, { useState, useEffect } from "react";
import { Container, Form, Button, Spinner, Card, Row, Col, Alert } from "react-bootstrap";
import Swal from "sweetalert2";
import api from "../../api/axiosConfig";
import "../../assets/estilos/ClienteLayout.css";



export default function Agendar() {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);

  const [formData, setFormData] = useState({
    persona_id: "",
    servicio_id: "",
    fecha: "",
    hora: "",
    horas_seleccionadas: 3,
    observaciones: "",
    forma_pago_id: 1,
  });

  // Cargar servicios al montar el componente
  useEffect(() => {
    const personaId = localStorage.getItem("persona_id");
    setFormData((f) => ({ ...f, persona_id: personaId }));
    cargarServicios();
    generateTimeSlots();
  }, []);

  const cargarServicios = async () => {
    try {
      const res = await api.get("/servicios/");
      setServicios(res.data);
    } catch (error) {
      Swal.fire("Error", "No se pudieron cargar los servicios", "error");
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 7; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    setTimeSlots(slots);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (name === "servicio_id") {
      const servicio = servicios.find(s => s.id_servicio === parseInt(value));
      setSelectedService(servicio);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.servicio_id) {
      Swal.fire("Error", "Por favor selecciona un servicio", "warning");
      return;
    }

    const hour = parseInt(formData.hora.split(":")[0]);
    if (hour < 7 || hour >= 18) {
      Swal.fire(
        "Horario inválido",
        "La lavandería atiende de 7:00 AM a 6:00 PM",
        "warning"
      );
      return;
    }

    try {
      const data = {
        persona_id: Number(formData.persona_id),
        servicio_id: Number(formData.servicio_id),
        fecha: formData.fecha,
        hora: formData.hora + ":00",
        observaciones: formData.observaciones,
        forma_pago_id: Number(formData.forma_pago_id),
      };

      await api.post("/agendamientos/", data);

      Swal.fire({
        title: "¡Reserva Confirmada!",
        text: "Tu servicio fue registrado exitosamente",
        icon: "success",
        confirmButtonColor: "#00C6B3",
        confirmButtonText: "Continuar"
      });

      // Reset form
      setFormData({
        ...formData,
        servicio_id: "",
        fecha: "",
        hora: "",
        observaciones: "",
      });
      setSelectedService(null);

    } catch (error) {
      console.log(error);
      Swal.fire("Error", "No se pudo registrar el agendamiento", "error");
    }
  };

  const calculateTotal = () => {
    if (!selectedService || !formData.horas_seleccionadas) return 0;
    return selectedService.precio_base * parseInt(formData.horas_seleccionadas);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-container">
          <Spinner animation="border" variant="primary" />
          <p>Cargando servicios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="agendar-container">
      <div className="agendar-header">
        <div className="header-content">
          <h1>Reservar Lavadora</h1>
          <p>Selecciona el servicio y programa tu lavado de forma rápida y sencilla</p>
        </div>
      </div>

      <Container>
        <Row className="justify-content-center">
          <Col lg={10}>
            <Card className="booking-card">
              <Card.Body className="card-body-custom">
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <div className="form-section">
                        <h4 className="section-title">
                          <i className="fas fa-tshirt"></i>
                          Seleccionar Servicio
                        </h4>
                        
                        <Form.Group className="mb-4">
                          <Form.Label className="form-label">Tipo de Lavadora</Form.Label>
                          <Form.Select
                            name="servicio_id"
                            value={formData.servicio_id}
                            onChange={handleChange}
                            required
                            className="form-select-custom"
                          >
                            <option value="">Selecciona una lavadora...</option>
                            {servicios.map((s) => (
                              <option key={s.id_servicio} value={s.id_servicio}>
                                {s.nombre_servicio} - ${s.precio_base}/hora
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>

                        {selectedService && (
                          <Card className="service-info-card">
                            <Card.Body>
                              <div className="service-header">
                                <h5>{selectedService.nombre_servicio}</h5>
                                <span className="service-badge premium">Premium</span>
                              </div>
                              <div className="service-details">
                                <div className="detail-item">
                                  <i className="fas fa-weight"></i>
                                  <span>Capacidad: {selectedService.capacidad || "15 kg"}</span>
                                </div>
                                <div className="detail-item">
                                  <i className="fas fa-cogs"></i>
                                  <span>Tipo: {selectedService.tipo || "Carga Frontal"}</span>
                                </div>
                                <div className="detail-item">
                                  <i className="fas fa-bolt"></i>
                                  <span>Consumo: {selectedService.consumo || "Bajo"}</span>
                                </div>
                                <div className="detail-item price">
                                  <i className="fas fa-dollar-sign"></i>
                                  <span>${selectedService.precio_base} / hora</span>
                                </div>
                              </div>
                            </Card.Body>
                          </Card>
                        )}
                      </div>
                    </Col>

                    <Col md={6}>
                      <div className="form-section">
                        <h4 className="section-title">
                          <i className="fas fa-calendar-alt"></i>
                          Programar Reserva
                        </h4>

                        <Form.Group className="mb-4">
                          <Form.Label className="form-label">Fecha</Form.Label>
                          <Form.Control
                            type="date"
                            name="fecha"
                            value={formData.fecha}
                            onChange={handleChange}
                            required
                            min={new Date().toISOString().split('T')[0]}
                            className="form-control-custom"
                          />
                        </Form.Group>

                        <Form.Group className="mb-4">
                          <Form.Label className="form-label">Hora de Inicio</Form.Label>
                          <Form.Select
                            name="hora"
                            value={formData.hora}
                            onChange={handleChange}
                            required
                            className="form-select-custom"
                          >
                            <option value="">Selecciona una hora...</option>
                            {timeSlots.map((time) => (
                              <option key={time} value={time}>
                                {time}
                              </option>
                            ))}
                          </Form.Select>
                          <div className="time-note">
                            <i className="fas fa-info-circle"></i>
                            Horario disponible: 7:00 AM - 6:00 PM
                          </div>
                        </Form.Group>

                        <Form.Group className="mb-4">
                          <Form.Label className="form-label">Duración del Servicio</Form.Label>
                          <Form.Select
                            name="horas_seleccionadas"
                            value={formData.horas_seleccionadas}
                            onChange={handleChange}
                            className="form-select-custom"
                          >
                            <option value="3">3 horas</option>
                            <option value="4">4 horas</option>
                            <option value="5">5 horas</option>
                            <option value="6">6 horas</option>
                          </Form.Select>
                          <div className="duration-note">
                            Mínimo 3 horas por reserva
                          </div>
                        </Form.Group>
                      </div>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <div className="form-section">
                        <h4 className="section-title">
                          <i className="fas fa-credit-card"></i>
                          Método de Pago
                        </h4>
                        
                        <Form.Group className="mb-4">
                          <Form.Select
                            name="forma_pago_id"
                            value={formData.forma_pago_id}
                            onChange={handleChange}
                            className="form-select-custom payment-select"
                          >
                            <option value="1">
                              <i className="fas fa-money-bill-wave"></i> Efectivo
                            </option>
                            <option value="2">
                              <i className="fas fa-credit-card"></i> Tarjeta Crédito/Débito
                            </option>
                            <option value="3">
                              <i className="fas fa-mobile-alt"></i> PSE
                            </option>
                            <option value="4">
                              <i className="fas fa-wallet"></i> Nequi/Daviplata
                            </option>
                          </Form.Select>
                        </Form.Group>
                      </div>
                    </Col>

                    <Col md={6}>
                      <div className="form-section">
                        <h4 className="section-title">
                          <i className="fas fa-sticky-note"></i>
                          Observaciones
                        </h4>
                        
                        <Form.Group className="mb-4">
                          <Form.Control
                            as="textarea"
                            rows={3}
                            name="observaciones"
                            value={formData.observaciones}
                            onChange={handleChange}
                            placeholder="Especificaciones especiales para tu lavado..."
                            className="form-control-custom"
                          />
                        </Form.Group>
                      </div>
                    </Col>
                  </Row>

                  {/* Resumen de Reserva */}
                  {selectedService && formData.horas_seleccionadas && (
                    <Card className="summary-card">
                      <Card.Body>
                        <h5 className="summary-title">
                          <i className="fas fa-receipt"></i>
                          Resumen de Reserva
                        </h5>
                        <div className="summary-details">
                          <div className="summary-item">
                            <span>Servicio:</span>
                            <span>{selectedService.nombre_servicio}</span>
                          </div>
                          <div className="summary-item">
                            <span>Fecha:</span>
                            <span>{formData.fecha}</span>
                          </div>
                          <div className="summary-item">
                            <span>Hora:</span>
                            <span>{formData.hora}</span>
                          </div>
                          <div className="summary-item">
                            <span>Duración:</span>
                            <span>{formData.horas_seleccionadas} horas</span>
                          </div>
                          <div className="summary-item">
                            <span>Precio por hora:</span>
                            <span>${selectedService.precio_base}</span>
                          </div>
                          <div className="summary-item total">
                            <span>Total a pagar:</span>
                            <span className="total-amount">${calculateTotal()}</span>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  )}

                  <div className="submit-section">
                    <Button 
                      type="submit" 
                      className="submit-button"
                      disabled={!formData.servicio_id || !formData.fecha || !formData.hora}
                    >
                      <i className="fas fa-calendar-check"></i>
                      Confirmar Reserva
                    </Button>
                    
                    <div className="security-note">
                      <i className="fas fa-shield-alt"></i>
                      Tu información está protegida y segura
                    </div>
                  </div>
                </Form>
              </Card.Body>
            </Card>

            {/* Información adicional */}
            <Row className="mt-4">
              <Col md={4}>
                <Card className="info-card">
                  <Card.Body>
                    <div className="info-icon">
                      <i className="fas fa-clock"></i>
                    </div>
                    <h6>Horarios Flexibles</h6>
                    <p>Reserva en el horario que mejor te convenga</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="info-card">
                  <Card.Body>
                    <div className="info-icon">
                      <i className="fas fa-dollar-sign"></i>
                    </div>
                    <h6>Precios Transparentes</h6>
                    <p>Sin cargos ocultos ni sorpresas</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="info-card">
                  <Card.Body>
                    <div className="info-icon">
                      <i className="fas fa-headset"></i>
                    </div>
                    <h6>Soporte 24/7</h6>
                    <p>Estamos aquí para ayudarte</p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </div>
  );
}