import { useEffect, useState } from "react";
import { Table, Spinner, Badge, Card, Row, Col, Button, Form } from "react-bootstrap";
import api from "../../api/axiosConfig";
import Swal from "sweetalert2";
import "../../assets/estilos/ClienteLayout.css";

export default function ClienteHistorial() {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("fecha");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    setLoading(true);
    try {
      const res = await api.get("/clientes/historial");
      const data = Array.isArray(res.data)
        ? res.data
        : (res.data.historial ?? res.data.hist ?? []);
      setHistorial(data);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo cargar el historial", "error");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (estado) => {
    const statusConfig = {
      'finalizado': { bg: 'success', text: 'Completado', icon: 'fa-check-circle' },
      'Finalizado': { bg: 'success', text: 'Completado', icon: 'fa-check-circle' },
      'en_proceso': { bg: 'info', text: 'En Proceso', icon: 'fa-spinner' },
      'cancelado': { bg: 'danger', text: 'Cancelado', icon: 'fa-times-circle' },
      'pendiente': { bg: 'warning', text: 'Pendiente', icon: 'fa-clock' }
    };

    const config = statusConfig[estado] || { bg: 'secondary', text: estado, icon: 'fa-question' };

    return (
      <Badge className={`status-badge ${config.bg}`}>
        <i className={`fas ${config.icon}`}></i>
        {config.text}
      </Badge>
    );
  };

  const getServiceIcon = (servicioNombre) => {
    const serviceIcons = {
      'lavadora': 'fa-tshirt',
      'secadora': 'fa-wind',
      'planchado': 'fa-iron',
      'express': 'fa-bolt',
      'completo': 'fa-star'
    };

    const nombre = servicioNombre?.toLowerCase() || '';
    for (const [key, icon] of Object.entries(serviceIcons)) {
      if (nombre.includes(key)) {
        return icon;
      }
    }
    return 'fa-tint';
  };

  const filteredAndSortedHistorial = historial
    .filter(item => {
      if (filter === "all") return true;
      if (filter === "completed") return item.estado?.toLowerCase().includes("finalizado");
      if (filter === "cancelled") return item.estado?.toLowerCase().includes("cancelado");
      return true;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case "fecha":
          aValue = new Date(a.fecha || a.fecha_finalizacion || a.fecha_servicio);
          bValue = new Date(b.fecha || b.fecha_finalizacion || b.fecha_servicio);
          break;
        case "precio":
          aValue = a.total ?? a.precio ?? 0;
          bValue = b.total ?? b.precio ?? 0;
          break;
        case "servicio":
          aValue = a.servicio?.nombre_servicio ?? a.servicio ?? "";
          bValue = b.servicio?.nombre_servicio ?? b.servicio ?? "";
          break;
        default:
          return 0;
      }

      if (sortOrder === "desc") {
        return bValue > aValue ? 1 : -1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });

  const stats = {
    total: historial.length,
    completed: historial.filter(item => 
      item.estado?.toLowerCase().includes("finalizado")
    ).length,
    totalSpent: historial.reduce((sum, item) => 
      sum + (item.total ?? item.precio ?? 0), 0
    ),
    average: historial.length > 0 ? 
      historial.reduce((sum, item) => sum + (item.total ?? item.precio ?? 0), 0) / historial.length : 0
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-container">
          <Spinner animation="border" variant="primary" />
          <p>Cargando tu historial...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="historial-container">
      <div className="historial-header">
        <div className="header-content">
          <h1>Historial de Servicios</h1>
          <p>Revisa el historial completo de tus reservas y servicios</p>
        </div>
      </div>

      <div className="container-fluid">
        {/* Estadísticas */}
        <Row className="stats-row mb-4">
          <Col lg={3} md={6} className="mb-3">
            <Card className="stat-card">
              <Card.Body>
                <div className="stat-icon total">
                  <i className="fas fa-history"></i>
                </div>
                <div className="stat-info">
                  <span className="stat-value">{stats.total}</span>
                  <span className="stat-label">Total Servicios</span>
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
                  <span className="stat-label">Completados</span>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <Card className="stat-card">
              <Card.Body>
                <div className="stat-icon money">
                  <i className="fas fa-dollar-sign"></i>
                </div>
                <div className="stat-info">
                  <span className="stat-value">${stats.totalSpent.toLocaleString()}</span>
                  <span className="stat-label">Total Gastado</span>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <Card className="stat-card">
              <Card.Body>
                <div className="stat-icon average">
                  <i className="fas fa-chart-line"></i>
                </div>
                <div className="stat-info">
                  <span className="stat-value">${stats.average.toFixed(0)}</span>
                  <span className="stat-label">Promedio por Servicio</span>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Filtros y Ordenamiento */}
        <Card className="filter-card mb-4">
          <Card.Body>
            <Row className="align-items-center">
              <Col md={6}>
                <div className="filter-section">
                  <h6>Filtrar por estado:</h6>
                  <div className="filter-buttons">
                    <Button
                      variant="outline-primary"
                      className={filter === "all" ? "active" : ""}
                      onClick={() => setFilter("all")}
                      size="sm"
                    >
                      Todos
                    </Button>
                    <Button
                      variant="outline-success"
                      className={filter === "completed" ? "active" : ""}
                      onClick={() => setFilter("completed")}
                      size="sm"
                    >
                      Completados
                    </Button>
                    <Button
                      variant="outline-danger"
                      className={filter === "cancelled" ? "active" : ""}
                      onClick={() => setFilter("cancelled")}
                      size="sm"
                    >
                      Cancelados
                    </Button>
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className="sort-section">
                  <Row>
                    <Col>
                      <Form.Select 
                        size="sm" 
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="sort-select"
                      >
                        <option value="fecha">Ordenar por Fecha</option>
                        <option value="precio">Ordenar por Precio</option>
                        <option value="servicio">Ordenar por Servicio</option>
                      </Form.Select>
                    </Col>
                    <Col>
                      <Button
                        variant="outline-secondary"
                        onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                        size="sm"
                        className="sort-order-btn"
                      >
                        <i className={`fas fa-sort-amount-${sortOrder === "desc" ? "down" : "up"}`}></i>
                        {sortOrder === "desc" ? "Descendente" : "Ascendente"}
                      </Button>
                    </Col>
                  </Row>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Lista de Historial */}
        <Card className="historial-card">
          <Card.Body>
            {filteredAndSortedHistorial.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-history"></i>
                <h4>No hay registros en el historial</h4>
                <p>Tu historial de servicios aparecerá aquí después de completar tu primera reserva</p>
                <Button variant="primary" className="btn-primary-custom">
                  <i className="fas fa-plus"></i>
                  Hacer mi Primera Reserva
                </Button>
              </div>
            ) : (
              <div className="historial-list">
                {filteredAndSortedHistorial.map((item, index) => (
                  <Card key={index} className="historial-item">
                    <Card.Body>
                      <Row className="align-items-center">
                        <Col md={1}>
                          <div className="service-icon">
                            <i className={`fas ${getServiceIcon(item.servicio?.nombre_servicio ?? item.servicio)}`}></i>
                          </div>
                        </Col>
                        
                        <Col md={3}>
                          <div className="service-info">
                            <h6>{item.servicio?.nombre_servicio ?? item.servicio ?? "Servicio no especificado"}</h6>
                            <small className="text-muted">
                              {item.fecha ?? item.fecha_finalizacion ?? item.fecha_servicio ?? "Fecha no disponible"}
                            </small>
                          </div>
                        </Col>
                        
                        <Col md={2}>
                          <div className="time-info">
                            {item.hora && (
                              <div className="detail-item">
                                <i className="fas fa-clock"></i>
                                <span>{item.hora}</span>
                              </div>
                            )}
                            {item.duracion && (
                              <div className="detail-item">
                                <i className="fas fa-hourglass-half"></i>
                                <span>{item.duracion}</span>
                              </div>
                            )}
                          </div>
                        </Col>
                        
                        <Col md={2}>
                          {getStatusBadge(item.estado)}
                        </Col>
                        
                        <Col md={2}>
                          <div className="price-info">
                            <span className="price-label">Total:</span>
                            <span className="price-value">
                              ${(item.total ?? item.precio ?? 0).toLocaleString("es-CO")}
                            </span>
                          </div>
                        </Col>
                        
                        <Col md={2}>
                          <div className="actions">
                            <Button variant="outline-primary" size="sm" className="action-btn">
                              <i className="fas fa-redo"></i>
                              Repetir
                            </Button>
                            <Button variant="outline-secondary" size="sm" className="action-btn">
                              <i className="fas fa-star"></i>
                              Valorar
                            </Button>
                          </div>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Exportar Historial */}
        <Card className="export-card mt-4">
          <Card.Body>
            <Row className="align-items-center">
              <Col md={8}>
                <h6>¿Necesitas tu historial completo?</h6>
                <p className="mb-0">Exporta tu historial de servicios en formato PDF o Excel</p>
              </Col>
              <Col md={4} className="text-end">
                <Button variant="outline-primary" className="me-2">
                  <i className="fas fa-file-pdf"></i>
                  PDF
                </Button>
                <Button variant="outline-success">
                  <i className="fas fa-file-excel"></i>
                  Excel
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}