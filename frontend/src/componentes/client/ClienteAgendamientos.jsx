import React, { useEffect, useState, useRef } from "react";
import { Container, Table, Button, Badge, Card, Row, Col, Spinner } from "react-bootstrap";
import api from "../../api/axiosConfig";
import Swal from "sweetalert2";
import "../../assets/estilos/ClienteLayout.css";

function formatoDuracion(segundos) {
  const horas = Math.floor(segundos / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);
  const secs = Math.floor(segundos % 60);
  return `${String(horas).padStart(2,"0")}:${String(minutos).padStart(2,"0")}:${String(secs).padStart(2,"0")}`;
}

export default function ClienteAgendamientos() {
  const [agendamientos, setAgendamientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const timersRef = useRef({});

  useEffect(() => {
    cargar();
    const interval = setInterval(() => cargar(), 10000);
    return () => clearInterval(interval);
  }, []);

  const cargar = async () => {
    setLoading(true);
    try {
      const res = await api.get("/cliente/historial");
      const data = res.data.historial || res.data || [];
      setAgendamientos(data);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo cargar tus agendamientos", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePagar = async (id_factura, total) => {
    const { value: forma } = await Swal.fire({
      title: "Selecciona forma de pago",
      input: "select",
      inputOptions: {
        1: "Efectivo",
        2: "Tarjeta Crédito/Débito",
        3: "PSE",
        4: "Nequi/Daviplata"
      },
      inputPlaceholder: "Selecciona un método",
      showCancelButton: true,
      confirmButtonColor: "#00C6B3",
      confirmButtonText: "Pagar",
      cancelButtonText: "Cancelar"
    });

    if (!forma) return;

    try {
      await api.post(`/facturas/${id_factura}/pagar`, { forma_pago_id: Number(forma) });
      Swal.fire({
        title: "¡Pago Exitoso!",
        text: `Tu pago de $${total} ha sido procesado correctamente`,
        icon: "success",
        confirmButtonColor: "#00C6B3"
      });
      cargar();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.response?.data?.detail || "No se pudo procesar el pago", "error");
    }
  };

  const getStatusBadge = (estado) => {
    const statusConfig = {
      'finalizado': { bg: 'success', text: 'Completado', icon: 'fa-check-circle' },
      'en_proceso': { bg: 'info', text: 'En Proceso', icon: 'fa-spinner' },
      'pendiente': { bg: 'warning', text: 'Pendiente', icon: 'fa-clock' },
      'cancelado': { bg: 'danger', text: 'Cancelado', icon: 'fa-times-circle' }
    };

    const config = statusConfig[estado] || { bg: 'secondary', text: estado, icon: 'fa-question' };

    return (
      <Badge className={`status-badge ${config.bg}`}>
        <i className={`fas ${config.icon}`}></i>
        {config.text}
      </Badge>
    );
  };

  const getPaymentBadge = (factura) => {
    if (!factura) {
      return <Badge className="status-badge secondary">Sin Factura</Badge>;
    }

    if (factura.estado && factura.estado.toLowerCase().includes("pag")) {
      return (
        <Badge className="status-badge success">
          <i className="fas fa-check-circle"></i>
          Pagada
        </Badge>
      );
    }

    return (
      <Button 
        size="sm" 
        className="pay-button"
        onClick={() => handlePagar(factura.id_factura, factura.total)}
      >
        <i className="fas fa-credit-card"></i>
        Pagar ${factura.total}
      </Button>
    );
  };

  const filteredAgendamientos = agendamientos.filter(agendamiento => {
    if (filter === "all") return true;
    if (filter === "active") return agendamiento.estado === "en_proceso";
    if (filter === "completed") return agendamiento.estado === "finalizado";
    if (filter === "pending") return agendamiento.estado === "pendiente";
    return true;
  });

  const stats = {
    total: agendamientos.length,
    active: agendamientos.filter(a => a.estado === "en_proceso").length,
    completed: agendamientos.filter(a => a.estado === "finalizado").length,
    pending: agendamientos.filter(a => a.estado === "pendiente").length
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-container">
          <Spinner animation="border" variant="primary" />
          <p>Cargando tus reservas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="agendamientos-container">
      <div className="agendamientos-header">
        <div className="header-content">
          <h1>Mis Reservas</h1>
          <p>Gestiona y revisa el estado de tus reservas de lavado</p>
        </div>
      </div>

      <Container fluid>
        {/* Estadísticas */}
        <Row className="stats-row mb-4">
          <Col lg={3} md={6} className="mb-3">
            <Card className="stat-card">
              <Card.Body>
                <div className="stat-icon total">
                  <i className="fas fa-calendar-check"></i>
                </div>
                <div className="stat-info">
                  <span className="stat-value">{stats.total}</span>
                  <span className="stat-label">Total Reservas</span>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <Card className="stat-card">
              <Card.Body>
                <div className="stat-icon active">
                  <i className="fas fa-spinner"></i>
                </div>
                <div className="stat-info">
                  <span className="stat-value">{stats.active}</span>
                  <span className="stat-label">En Proceso</span>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <Card className="stat-card">
              <Card.Body>
                <div className="stat-icon completed">
                  <i className="fas fa-check-circle"></i>
                </div>
                <div className="stat-info">
                  <span className="stat-value">{stats.completed}</span>
                  <span className="stat-label">Completadas</span>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <Card className="stat-card">
              <Card.Body>
                <div className="stat-icon pending">
                  <i className="fas fa-clock"></i>
                </div>
                <div className="stat-info">
                  <span className="stat-value">{stats.pending}</span>
                  <span className="stat-label">Pendientes</span>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Filtros */}
        <Card className="filter-card mb-4">
          <Card.Body>
            <div className="filter-section">
              <h5>Filtrar por estado:</h5>
              <div className="filter-buttons">
                <Button
                  variant="outline-primary"
                  className={filter === "all" ? "active" : ""}
                  onClick={() => setFilter("all")}
                >
                  Todas
                </Button>
                <Button
                  variant="outline-info"
                  className={filter === "active" ? "active" : ""}
                  onClick={() => setFilter("active")}
                >
                  En Proceso
                </Button>
                <Button
                  variant="outline-success"
                  className={filter === "completed" ? "active" : ""}
                  onClick={() => setFilter("completed")}
                >
                  Completadas
                </Button>
                <Button
                  variant="outline-warning"
                  className={filter === "pending" ? "active" : ""}
                  onClick={() => setFilter("pending")}
                >
                  Pendientes
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Lista de Agendamientos */}
        <Card className="agendamientos-card">
          <Card.Body>
            {filteredAgendamientos.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-calendar-times"></i>
                <h4>No hay reservas</h4>
                <p>No se encontraron reservas con los filtros seleccionados</p>
                <Button 
                  variant="primary" 
                  onClick={() => setFilter("all")}
                  className="btn-view-all"
                >
                  Ver todas las reservas
                </Button>
              </div>
            ) : (
              <div className="agendamientos-list">
                {filteredAgendamientos.map((agendamiento, index) => {
                  const factura = agendamiento.factura || null;
                  
                  return (
                    <Card key={index} className="agendamiento-item">
                      <Card.Body>
                        <Row className="align-items-center">
                          <Col md={2}>
                            <div className="agendamiento-id">
                              <span className="id-label">Reserva</span>
                              <span className="id-value">#{agendamiento.id_agendamiento || agendamiento.id}</span>
                            </div>
                          </Col>
                          
                          <Col md={2}>
                            <div className="service-info">
                              <h6>{agendamiento.servicio?.nombre_servicio || agendamiento.servicio}</h6>
                              <small className="text-muted">{agendamiento.fecha}</small>
                            </div>
                          </Col>
                          
                          <Col md={2}>
                            <div className="time-info">
                              <div className="detail-item">
                                <i className="fas fa-clock"></i>
                                <span>{agendamiento.hora || "-"}</span>
                              </div>
                              {agendamiento.duracion && (
                                <div className="detail-item">
                                  <i className="fas fa-hourglass-half"></i>
                                  <span>{agendamiento.duracion}</span>
                                </div>
                              )}
                            </div>
                          </Col>
                          
                          <Col md={2}>
                            {getStatusBadge(agendamiento.estado)}
                          </Col>
                          
                          <Col md={2}>
                            <div className="payment-info">
                              {factura ? (
                                <div className="amount">
                                  <span className="amount-label">Total:</span>
                                  <span className="amount-value">${factura.total}</span>
                                </div>
                              ) : (
                                <span className="no-invoice">Sin factura</span>
                              )}
                            </div>
                          </Col>
                          
                          <Col md={2}>
                            <div className="actions">
                              {getPaymentBadge(factura)}
                            </div>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  );
                })}
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Información adicional */}
        <Row className="mt-4">
          <Col md={6}>
            <Card className="info-card">
              <Card.Body>
                <div className="info-icon">
                  <i className="fas fa-sync-alt"></i>
                </div>
                <h6>Actualización Automática</h6>
                <p>La información se actualiza automáticamente cada 10 segundos</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="info-card">
              <Card.Body>
                <div className="info-icon">
                  <i className="fas fa-question-circle"></i>
                </div>
                <h6>¿Necesitas ayuda?</h6>
                <p>Si tienes problemas con tu reserva, contacta a soporte</p>
                <Button variant="outline-primary" size="sm">
                  Contactar Soporte
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}