import { useEffect, useState } from "react";
import { Card, Row, Col, Button, Spinner, Form, Badge } from "react-bootstrap";
import Swal from "sweetalert2";
import api from "../../api/axiosConfig";
import "../../assets/estilos/ClienteLayout.css";

export default function ClienteServicios() {
  const [servicios, setServicios] = useState([]);
  const [filteredServicios, setFilteredServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("price");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    cargarServicios();
  }, []);

  useEffect(() => {
    filterAndSortServicios();
  }, [servicios, filter, sortBy, searchTerm]);

  const cargarServicios = async () => {
    setLoading(true);
    try {
      const res = await api.get("/servicios/");
      const data = Array.isArray(res.data)
        ? res.data.map((s) => ({
            id: s.id_servicio ?? s.id ?? s.idService,
            nombre: s.nombre_servicio ?? s.nombre ?? s.name,
            descripcion: s.descripcion ?? s.desc ?? "",
            precio: s.precio_base ?? s.precio ?? 0,
            duracion: s.duracion_minutos ?? s.duracion ?? 60,
            tipo: s.tipo_servicio ?? s.tipo ?? "standard",
            capacidad: s.capacidad ?? "15 kg",
            disponible: s.disponible ?? true,
            popular: s.popular ?? false,
            imagen: s.imagen_url ?? s.imagen ?? getDefaultImage(s.tipo_servicio ?? s.tipo)
          }))
        : [];
      setServicios(data);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", error.response?.data?.detail || "No se pudieron cargar los servicios", "error");
    } finally {
      setLoading(false);
    }
  };

  const getDefaultImage = (tipo) => {
    const images = {
      'lavadora': 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'secadora': 'https://images.unsplash.com/photo-1581993192008-63fd1ea7de1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'express': 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'premium': 'https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    };
    return images[tipo?.toLowerCase()] || images.lavadora;
  };

  const filterAndSortServicios = () => {
    let filtered = servicios.filter(servicio => {
      // Filtro por tipo
      const typeMatch = filter === "all" || servicio.tipo === filter;
      // Filtro por búsqueda
      const searchMatch = servicio.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         servicio.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
      return typeMatch && searchMatch;
    });

    // Ordenamiento
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price":
          return a.precio - b.precio;
        case "price-desc":
          return b.precio - a.precio;
        case "name":
          return a.nombre.localeCompare(b.nombre);
        case "popular":
          return (b.popular ? 1 : 0) - (a.popular ? 1 : 0);
        default:
          return 0;
      }
    });

    setFilteredServicios(filtered);
  };

  const handleAgendar = async (servicio) => {
    const { value: formValues } = await Swal.fire({
      title: `Agendar ${servicio.nombre}`,
      html: `
        <div class="text-start">
          <label for="swal-fecha" class="form-label">Fecha</label>
          <input type="date" id="swal-fecha" class="form-control" min="${new Date().toISOString().split('T')[0]}" required>
          
          <label for="swal-hora" class="form-label mt-3">Hora de inicio</label>
          <select id="swal-hora" class="form-select" required>
            <option value="">Selecciona una hora</option>
            <option value="08:00">8:00 AM</option>
            <option value="10:00">10:00 AM</option>
            <option value="12:00">12:00 PM</option>
            <option value="14:00">2:00 PM</option>
            <option value="16:00">4:00 PM</option>
          </select>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Confirmar Reserva",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#00C6B3",
      preConfirm: () => {
        const fecha = document.getElementById('swal-fecha').value;
        const hora = document.getElementById('swal-hora').value;
        if (!fecha || !hora) {
          Swal.showValidationMessage('Por favor completa todos los campos');
        }
        return { fecha, hora };
      }
    });

    if (formValues) {
      try {
        const payload = { 
          fecha: formValues.fecha,
          hora: formValues.hora + ":00"
        };
        await api.post(`/clientes/agendar/${servicio.id}`, payload);
        Swal.fire({
          title: "¡Reserva Confirmada!",
          text: `Tu servicio ${servicio.nombre} ha sido agendado para el ${formValues.fecha} a las ${formValues.hora}`,
          icon: "success",
          confirmButtonColor: "#00C6B3"
        });
      } catch (error) {
        console.error(error);
        Swal.fire("Error", error.response?.data?.detail || "No se pudo agendar el servicio", "error");
      }
    }
  };

  const getServiceIcon = (tipo) => {
    const icons = {
      'lavadora': 'fa-tshirt',
      'secadora': 'fa-wind',
      'express': 'fa-bolt',
      'premium': 'fa-crown',
      'standard': 'fa-tint'
    };
    return icons[tipo] || 'fa-tint';
  };

  const getServiceBadge = (tipo) => {
    const badges = {
      'lavadora': { text: 'Lavadora', variant: 'primary' },
      'secadora': { text: 'Secadora', variant: 'info' },
      'express': { text: 'Express', variant: 'warning' },
      'premium': { text: 'Premium', variant: 'success' },
      'standard': { text: 'Estándar', variant: 'secondary' }
    };
    const badge = badges[tipo] || { text: tipo, variant: 'secondary' };
    return <Badge className={`service-badge ${badge.variant}`}>{badge.text}</Badge>;
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
    <div className="servicios-container">
      <div className="servicios-header">
        <div className="header-content">
          <h1>Servicios Disponibles</h1>
          <p>Descubre todos nuestros servicios de lavandería y elige el que mejor se adapte a tus necesidades</p>
        </div>
      </div>

      <div className="container-fluid">
        {/* Filtros y Búsqueda */}
        <Card className="filter-card mb-4">
          <Card.Body>
            <Row className="align-items-center">
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="form-label">Buscar Servicios</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Buscar por nombre o descripción..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="form-label">Filtrar por Tipo</Form.Label>
                  <Form.Select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">Todos los Servicios</option>
                    <option value="lavadora">Lavadoras</option>
                    <option value="secadora">Secadoras</option>
                    <option value="express">Servicio Express</option>
                    <option value="premium">Premium</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="form-label">Ordenar por</Form.Label>
                  <Form.Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="sort-select"
                  >
                    <option value="price">Precio: Menor a Mayor</option>
                    <option value="price-desc">Precio: Mayor a Menor</option>
                    <option value="name">Nombre A-Z</option>
                    <option value="popular">Más Populares</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Estadísticas Rápidas */}
        <Row className="stats-row mb-4">
          <Col lg={3} md={6} className="mb-3">
            <Card className="stat-card">
              <Card.Body>
                <div className="stat-icon total">
                  <i className="fas fa-list"></i>
                </div>
                <div className="stat-info">
                  <span className="stat-value">{servicios.length}</span>
                  <span className="stat-label">Total Servicios</span>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <Card className="stat-card">
              <Card.Body>
                <div className="stat-icon available">
                  <i className="fas fa-check-circle"></i>
                </div>
                <div className="stat-info">
                  <span className="stat-value">{servicios.filter(s => s.disponible).length}</span>
                  <span className="stat-label">Disponibles</span>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <Card className="stat-card">
              <Card.Body>
                <div className="stat-icon popular">
                  <i className="fas fa-star"></i>
                </div>
                <div className="stat-info">
                  <span className="stat-value">{servicios.filter(s => s.popular).length}</span>
                  <span className="stat-label">Populares</span>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <Card className="stat-card">
              <Card.Body>
                <div className="stat-icon premium">
                  <i className="fas fa-crown"></i>
                </div>
                <div className="stat-info">
                  <span className="stat-value">{servicios.filter(s => s.tipo === 'premium').length}</span>
                  <span className="stat-label">Premium</span>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Grid de Servicios */}
        {filteredServicios.length === 0 ? (
          <Card className="empty-card">
            <Card.Body className="text-center py-5">
              <i className="fas fa-search empty-icon"></i>
              <h4>No se encontraron servicios</h4>
              <p className="text-muted">Intenta ajustar los filtros de búsqueda</p>
              <Button 
                variant="primary" 
                onClick={() => {
                  setFilter("all");
                  setSearchTerm("");
                }}
              >
                <i className="fas fa-refresh"></i>
                Mostrar Todos los Servicios
              </Button>
            </Card.Body>
          </Card>
        ) : (
          <Row>
            {filteredServicios.map((servicio) => (
              <Col xl={4} lg={6} md={6} key={servicio.id} className="mb-4">
                <Card className="service-card">
                  <div className="service-image-container">
                    <img 
                      src={servicio.imagen} 
                      alt={servicio.nombre}
                      className="service-image"
                    />
                    {servicio.popular && (
                      <div className="popular-badge">
                        <i className="fas fa-star"></i>
                        Popular
                      </div>
                    )}
                    {!servicio.disponible && (
                      <div className="unavailable-overlay">
                        No Disponible
                      </div>
                    )}
                  </div>
                  
                  <Card.Body>
                    <div className="service-header">
                      <div className="service-title-section">
                        <h5 className="service-title">{servicio.nombre}</h5>
                        {getServiceBadge(servicio.tipo)}
                      </div>
                      <div className="service-icon">
                        <i className={`fas ${getServiceIcon(servicio.tipo)}`}></i>
                      </div>
                    </div>
                    
                    <p className="service-description">{servicio.descripcion}</p>
                    
                    <div className="service-details">
                      <div className="detail-item">
                        <i className="fas fa-clock"></i>
                        <span>{servicio.duracion} minutos</span>
                      </div>
                      <div className="detail-item">
                        <i className="fas fa-weight"></i>
                        <span>{servicio.capacidad}</span>
                      </div>
                    </div>
                    
                    <div className="service-footer">
                      <div className="price-section">
                        <span className="price-label">Desde</span>
                        <span className="price">${servicio.precio.toLocaleString()}</span>
                        <span className="price-unit">/servicio</span>
                      </div>
                      
                      <Button
                        variant="primary"
                        className="book-btn"
                        onClick={() => handleAgendar(servicio)}
                        disabled={!servicio.disponible}
                      >
                        {servicio.disponible ? (
                          <>
                            <i className="fas fa-calendar-plus"></i>
                            Reservar Ahora
                          </>
                        ) : (
                          <>
                            <i className="fas fa-clock"></i>
                            No Disponible
                          </>
                        )}
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* Información Adicional */}
        <Card className="info-card mt-4">
          <Card.Body>
            <Row className="align-items-center">
              <Col md={8}>
                <h6>¿No encuentras lo que buscas?</h6>
                <p className="mb-0">Contáctanos para servicios personalizados o consultas especiales</p>
              </Col>
              <Col md={4} className="text-end">
                <Button variant="outline-primary">
                  <i className="fas fa-headset"></i>
                  Contactar Soporte
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}