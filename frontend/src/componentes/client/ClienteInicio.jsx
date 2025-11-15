// client/client/ClienteInicio.jsx
import { useState } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Badge,
  Button
} from 'react-bootstrap';
import "./Footer";
import "../../assets/estilos/ClienteStile.css";

export default function ClienteInicio() {
  const [stats] = useState({
    activeReservations: 2,
    completedReservations: 15
  });

  const [activeReservations] = useState([
    {
      id: 1,
      washerName: "Samsung EcoBubble",
      location: "Centro Comercial Santafé",
      date: "2024-01-15",
      time: "14:00 - 16:00",
      status: "active",
      price: 3500
    },
    {
      id: 2,
      washerName: "LG SteamWasher", 
      location: "Unicentro Bogotá",
      date: "2024-01-16",
      time: "10:00 - 11:00",
      status: "upcoming",
      price: 3200
    }
  ]);

  const quickActions = [
    {
      id: 1,
      icon: <Plus size={24} />,
      title: "Nueva Reserva",
      description: "Reserva una lavadora ahora",
      link: "/cliente/agendar"
    },
    {
      id: 2,
      icon: <Clock size={24} />,
      title: "Extender Reserva", 
      description: "Añade más tiempo a tu reserva actual",
      link: "#"
    },
    {
      id: 3,
      icon: <MapPin size={24} />,
      title: "Encontrar Ubicación",
      description: "Busca lavadoras cerca de ti", 
      link: "#"
    },
    {
      id: 4,
      icon: <Headphones size={24} />,
      title: "Soporte",
      description: "¿Necesitas ayuda?",
      link: "/cliente/soporte"
    }
  ];

  const getStatusVariant = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'upcoming': return 'warning';
      case 'completed': return 'primary';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'En Curso';
      case 'upcoming': return 'Próxima';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  return (
    <Container fluid>
      {/* Welcome Section */}
      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm" style={{ 
            background: 'linear-gradient(135deg, #f0f9ff 0%, #E6F7FF 100%)',
            borderRadius: '16px',
            overflow: 'hidden'
          }}>
            <Card.Body className="p-4">
              <Row className="align-items-center">
                <Col md={8}>
                  <h1 className="fw-bold mb-3" style={{
                    background: 'linear-gradient(135deg, #1a1a2e 0%, #00C6B3 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                    ¡Hola, María!
                  </h1>
                  <p className="text-muted mb-4 fs-5">
                    Gestiona tus reservas y alquila lavadoras de forma rápida y sencilla
                  </p>
                  
                  <Row className="g-3">
                    <Col sm={6}>
                      <Card className="border-0 shadow-sm h-100">
                        <Card.Body className="d-flex align-items-center">
                          <div className="bg-primary rounded p-3 me-3">
                            <Clock size={24} className="text-white" />
                          </div>
                          <div>
                            <h4 className="fw-bold mb-0">{stats.activeReservations}</h4>
                            <small className="text-muted">Reservas Activas</small>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col sm={6}>
                      <Card className="border-0 shadow-sm h-100">
                        <Card.Body className="d-flex align-items-center">
                          <div className="bg-success rounded p-3 me-3">
                            <CheckCircle size={24} className="text-white" />
                          </div>
                          <div>
                            <h4 className="fw-bold mb-0">{stats.completedReservations}</h4>
                            <small className="text-muted">Reservas Completadas</small>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </Col>
                
                <Col md={4} className="text-center position-relative">
                  <div className="position-relative" style={{ height: '200px' }}>
                    <div className="position-absolute" style={{ top: '20px', left: '0', animation: 'float 3s ease-in-out infinite' }}>
                      <div className="bg-white rounded shadow-sm p-3">
                        <Tshirt size={24} className="text-primary" />
                      </div>
                    </div>
                    <div className="position-absolute" style={{ top: '0', right: '40px', animation: 'float 3s ease-in-out infinite 1s' }}>
                      <div className="bg-white rounded shadow-sm p-3">
                        <Soap size={24} className="text-primary" />
                      </div>
                    </div>
                    <div className="position-absolute" style={{ bottom: '30px', right: '0', animation: 'float 3s ease-in-out infinite 2s' }}>
                      <div className="bg-white rounded shadow-sm p-3">
                        <Wind size={24} className="text-primary" />
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold mb-3">Acciones Rápidas</h2>
          <Row className="g-3">
            {quickActions.map((action) => (
              <Col key={action.id} sm={6} lg={3}>
                <Card 
                  className="border-0 shadow-sm h-100 text-center hover-card"
                  style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                  onClick={() => window.location.href = action.link}
                >
                  <Card.Body className="p-4">
                    <div className="bg-primary rounded-circle p-3 mx-auto mb-3" style={{ width: '70px', height: '70px' }}>
                      <div className="text-white">
                        {action.icon}
                      </div>
                    </div>
                    <h5 className="fw-bold">{action.title}</h5>
                    <p className="text-muted small">{action.description}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>

      {/* Active Reservations */}
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="fw-bold mb-0">Reservas Activas</h2>
            <Button variant="outline-primary" size="sm">
              Ver todas
            </Button>
          </div>
          
          <Row className="g-3">
            {activeReservations.map((reservation) => (
              <Col key={reservation.id} lg={6}>
                <Card className="border-0 shadow-sm h-100" style={{ borderLeft: `4px solid var(--bs-${getStatusVariant(reservation.status)})` }}>
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <h5 className="fw-bold mb-0">{reservation.washerName}</h5>
                      <Badge bg={getStatusVariant(reservation.status)}>
                        {getStatusText(reservation.status)}
                      </Badge>
                    </div>
                    
                    <div className="mb-3">
                      <div className="d-flex align-items-center mb-2">
                        <MapPin size={16} className="text-primary me-2" />
                        <span className="text-muted">{reservation.location}</span>
                      </div>
                      <div className="d-flex align-items-center mb-2">
                        <Calendar size={16} className="text-primary me-2" />
                        <span className="text-muted">{reservation.date} | {reservation.time}</span>
                      </div>
                      <div className="d-flex align-items-center">
                        <DollarSign size={16} className="text-primary me-2" />
                        <span className="text-muted">${reservation.price} COP</span>
                      </div>
                    </div>
                    
                    <div className="d-flex gap-2">
                      <Button variant="outline-primary" size="sm">
                        Ver Detalles
                      </Button>
                      {reservation.status === 'active' && (
                        <Button variant="outline-success" size="sm">
                          Extender Tiempo
                        </Button>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
    </Container>
  );
}