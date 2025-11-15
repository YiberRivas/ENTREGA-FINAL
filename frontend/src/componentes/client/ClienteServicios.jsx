// client/client/ClienteServicios.jsx
import { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Form, 
  Button, 
  Badge,
  Modal,
  InputGroup
} from 'react-bootstrap';
import { 
  Search,
  Filter,
  MapPin,
  Star,
  Zap,
  Shield,
  Clock,
  DollarSign,
  Users,
  CheckCircle,
  Heart,
  Share2
} from 'lucide-react';

export default function ClienteServicios() {
  const [washers, setWashers] = useState([]);
  const [filteredWashers, setFilteredWashers] = useState([]);
  const [selectedWasher, setSelectedWasher] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Estados para filtros
  const [filters, setFilters] = useState({
    search: '',
    location: 'all',
    type: 'all',
    price: 'all',
    status: 'all'
  });

  // Datos de ejemplo de lavadoras
  const washerData = [
    {
      id: 1,
      name: "Samsung EcoBubble",
      type: "premium",
      location: "Centro Comercial Santafé",
      price: 3500,
      status: "available",
      image: "/lavadoras/samsung-ecobubble.jpg",
      description: "Lavadora de última generación con tecnología EcoBubble que cuida tus prendas",
      features: ["Capacidad 18kg", "Tecnología EcoBubble", "Ahorro energético A+++", "8 programas"],
      specifications: {
        capacity: "18kg",
        programs: 8,
        energyClass: "A+++",
        speed: "1400 RPM"
      },
      rating: 4.8,
      reviews: 124,
      available: 3
    },
    {
      id: 2,
      name: "LG SteamWasher",
      type: "premium", 
      location: "Unicentro Bogotá",
      price: 3800,
      status: "available",
      image: "/lavadoras/lg-steam.jpg",
      description: "Lavadora con tecnología Steam que elimina bacterias y alergenos",
      features: ["Tecnología Steam", "Capacidad 17kg", "SmartThinQ", "Cuidado de prendas"],
      specifications: {
        capacity: "17kg",
        programs: 6,
        energyClass: "A+++",
        speed: "1200 RPM"
      },
      rating: 4.9,
      reviews: 89,
      available: 2
    },
    {
      id: 3,
      name: "Whirlpool Ultimate Care",
      type: "standard",
      location: "Centro Comercial Andino", 
      price: 3000,
      status: "available",
      image: "/lavadoras/whirlpool.jpg",
      description: "Lavadora confiable con excelente relación calidad-precio",
      features: ["Capacidad 15kg", "6th Sense Technology", "6 programas", "Display digital"],
      specifications: {
        capacity: "15kg",
        programs: 6,
        energyClass: "A++",
        speed: "1000 RPM"
      },
      rating: 4.5,
      reviews: 203,
      available: 5
    },
    {
      id: 4,
      name: "Miele Compact",
      type: "compact",
      location: "Plaza de las Américas",
      price: 2800,
      status: "available",
      image: "/lavadoras/miele-compact.jpg",
      description: "Lavadora compacta ideal para espacios pequeños",
      features: ["Capacidad 8kg", "Diseño compacto", "Silenciosa", "Económica"],
      specifications: {
        capacity: "8kg",
        programs: 4,
        energyClass: "A+++",
        speed: "800 RPM"
      },
      rating: 4.6,
      reviews: 67,
      available: 1
    },
    {
      id: 5,
      name: "Bosch Silence",
      type: "standard",
      location: "Centro Comercial Santafé",
      price: 3200,
      status: "maintenance",
      image: "/lavadoras/bosch-silence.jpg",
      description: "Tecnología silenciosa perfecta para hogares",
      features: ["Tecnología Silence", "Capacidad 14kg", "EcoSilence Drive", "5 programas"],
      specifications: {
        capacity: "14kg",
        programs: 5,
        energyClass: "A++",
        speed: "1100 RPM"
      },
      rating: 4.7,
      reviews: 156,
      available: 0
    },
    {
      id: 6,
      name: "Haier Smart",
      type: "premium",
      location: "Unicentro Bogotá",
      price: 4000,
      status: "available",
      image: "/lavadoras/haier-smart.jpg",
      description: "Lavadora inteligente con control desde tu smartphone",
      features: ["Control WiFi", "Capacidad 20kg", "Auto-dosificación", "12 programas"],
      specifications: {
        capacity: "20kg",
        programs: 12,
        energyClass: "A+++",
        speed: "1600 RPM"
      },
      rating: 4.9,
      reviews: 45,
      available: 2
    }
  ];

  // Opciones de filtros
  const filterOptions = {
    location: [
      { value: 'all', label: 'Todas las ubicaciones' },
      { value: 'Centro Comercial Santafé', label: 'Centro Comercial Santafé' },
      { value: 'Unicentro Bogotá', label: 'Unicentro Bogotá' },
      { value: 'Centro Comercial Andino', label: 'Centro Comercial Andino' },
      { value: 'Plaza de las Américas', label: 'Plaza de las Américas' }
    ],
    type: [
      { value: 'all', label: 'Todos los tipos' },
      { value: 'premium', label: 'Premium' },
      { value: 'standard', label: 'Estándar' },
      { value: 'compact', label: 'Compacta' }
    ],
    price: [
      { value: 'all', label: 'Cualquier precio' },
      { value: 'low', label: 'Menos de $3,000' },
      { value: 'medium', label: '$3,000 - $4,000' },
      { value: 'high', label: 'Más de $4,000' }
    ],
    status: [
      { value: 'all', label: 'Todos los estados' },
      { value: 'available', label: 'Disponible' },
      { value: 'maintenance', label: 'En mantenimiento' }
    ]
  };

  // Inicializar datos
  useEffect(() => {
    setWashers(washerData);
    setFilteredWashers(washerData);
  }, []);

  // Aplicar filtros
  useEffect(() => {
    let result = washers;

    // Filtro de búsqueda
    if (filters.search) {
      result = result.filter(washer =>
        washer.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        washer.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Filtro de ubicación
    if (filters.location !== 'all') {
      result = result.filter(washer => washer.location === filters.location);
    }

    // Filtro de tipo
    if (filters.type !== 'all') {
      result = result.filter(washer => washer.type === filters.type);
    }

    // Filtro de precio
    if (filters.price !== 'all') {
      switch (filters.price) {
        case 'low':
          result = result.filter(washer => washer.price < 3000);
          break;
        case 'medium':
          result = result.filter(washer => washer.price >= 3000 && washer.price <= 4000);
          break;
        case 'high':
          result = result.filter(washer => washer.price > 4000);
          break;
      }
    }

    // Filtro de estado
    if (filters.status !== 'all') {
      result = result.filter(washer => washer.status === filters.status);
    }

    setFilteredWashers(result);
  }, [filters, washers]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleWasherClick = (washer) => {
    setSelectedWasher(washer);
    setShowDetailModal(true);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'premium': return <Star className="text-warning" size={20} />;
      case 'standard': return <Zap className="text-success" size={20} />;
      case 'compact': return <Shield className="text-info" size={20} />;
      default: return <Zap size={20} />;
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'premium': return { label: 'Premium', variant: 'warning' };
      case 'standard': return { label: 'Estándar', variant: 'success' };
      case 'compact': return { label: 'Compacta', variant: 'info' };
      default: return { label: type, variant: 'secondary' };
    }
  };

  const getStatusBadge = (status, available) => {
    if (status === 'maintenance') {
      return { label: 'En Mantenimiento', variant: 'danger' };
    }
    return available > 0 
      ? { label: `${available} Disponibles`, variant: 'success' }
      : { label: 'Agotado', variant: 'danger' };
  };

  const renderStars = (rating) => {
    return (
      <div className="d-flex align-items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= rating ? 'text-warning fill-warning' : 'text-muted'}
            fill={star <= rating ? 'currentColor' : 'none'}
          />
        ))}
        <small className="text-muted ms-2">({rating})</small>
      </div>
    );
  };

  return (
    <Container fluid>
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="text-center">
            <h1 className="fw-bold mb-3">Lavadoras Disponibles</h1>
            <p className="text-muted fs-5">
              Encuentra la lavadora perfecta para tus necesidades
            </p>
          </div>
        </Col>
      </Row>

      {/* Filtros */}
      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <Row className="g-3 align-items-end">
                {/* Búsqueda */}
                <Col md={3}>
                  <Form.Label className="fw-bold">Buscar lavadora</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <Search size={18} />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Nombre o características..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                    />
                  </InputGroup>
                </Col>

                {/* Filtro de ubicación */}
                <Col md={2}>
                  <Form.Label className="fw-bold">Ubicación</Form.Label>
                  <Form.Select
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                  >
                    {filterOptions.location.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                </Col>

                {/* Filtro de tipo */}
                <Col md={2}>
                  <Form.Label className="fw-bold">Tipo</Form.Label>
                  <Form.Select
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                  >
                    {filterOptions.type.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                </Col>

                {/* Filtro de precio */}
                <Col md={2}>
                  <Form.Label className="fw-bold">Precio</Form.Label>
                  <Form.Select
                    value={filters.price}
                    onChange={(e) => handleFilterChange('price', e.target.value)}
                  >
                    {filterOptions.price.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                </Col>

                {/* Filtro de estado */}
                <Col md={2}>
                  <Form.Label className="fw-bold">Estado</Form.Label>
                  <Form.Select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    {filterOptions.status.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                </Col>

                {/* Contador de resultados */}
                <Col md={1}>
                  <div className="text-center">
                    <Badge bg="primary" className="fs-6 p-2">
                      {filteredWashers.length}
                    </Badge>
                    <div className="text-muted small mt-1">Resultados</div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Grid de Lavadoras */}
      <Row className="g-4">
        {filteredWashers.length > 0 ? (
          filteredWashers.map((washer) => {
            const typeBadge = getTypeBadge(washer.type);
            const statusBadge = getStatusBadge(washer.status, washer.available);

            return (
              <Col key={washer.id} xl={4} lg={6}>
                <Card 
                  className="border-0 shadow-sm h-100 washer-card"
                  style={{ 
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => handleWasherClick(washer)}
                >
                  {/* Ribbon de estado */}
                  <div className="position-absolute top-0 end-0 m-2">
                    <Badge bg={statusBadge.variant}>
                      {statusBadge.label}
                    </Badge>
                  </div>

                  {/* Imagen de la lavadora */}
                  <div 
                    className="bg-light position-relative"
                    style={{ 
                      height: '200px', 
                      background: `linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <div className="text-center">
                      {getTypeIcon(washer.type)}
                      <div className="mt-2 text-muted small">Imagen de referencia</div>
                    </div>
                  </div>

                  <Card.Body className="p-4">
                    {/* Header con nombre y tipo */}
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <h5 className="fw-bold mb-0">{washer.name}</h5>
                      <Badge bg={typeBadge.variant} className="ms-2">
                        {typeBadge.label}
                      </Badge>
                    </div>

                    {/* Ubicación */}
                    <div className="d-flex align-items-center mb-3">
                      <MapPin size={16} className="text-primary me-2" />
                      <small className="text-muted">{washer.location}</small>
                    </div>

                    {/* Descripción */}
                    <p className="text-muted small mb-3">
                      {washer.description}
                    </p>

                    {/* Características principales */}
                    <div className="mb-3">
                      {washer.features.slice(0, 3).map((feature, index) => (
                        <Badge 
                          key={index} 
                          bg="light" 
                          text="dark" 
                          className="me-1 mb-1 small"
                        >
                          {feature}
                        </Badge>
                      ))}
                    </div>

                    {/* Rating y reviews */}
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      {renderStars(washer.rating)}
                      <small className="text-muted">({washer.reviews} reviews)</small>
                    </div>

                    {/* Precio y acción */}
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h4 className="text-primary fw-bold mb-0">
                          ${washer.price} COP/h
                        </h4>
                        <small className="text-muted">por hora</small>
                      </div>
                      
                      <Button 
                        variant="primary" 
                        size="sm"
                        disabled={washer.status === 'maintenance' || washer.available === 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `/cliente/agendar?washer=${washer.id}`;
                        }}
                      >
                        Reservar Ahora
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })
        ) : (
          <Col>
            <Card className="border-0 shadow-sm text-center py-5">
              <Card.Body>
                <Filter size={48} className="text-muted mb-3" />
                <h4 className="text-muted">No se encontraron lavadoras</h4>
                <p className="text-muted">
                  Intenta ajustar los filtros para ver más resultados
                </p>
                <Button 
                  variant="outline-primary"
                  onClick={() => setFilters({
                    search: '',
                    location: 'all',
                    type: 'all',
                    price: 'all',
                    status: 'all'
                  })}
                >
                  Limpiar filtros
                </Button>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

      {/* Modal de Detalles */}
      <Modal 
        show={showDetailModal} 
        onHide={() => setShowDetailModal(false)} 
        size="lg"
        centered
      >
        {selectedWasher && (
          <>
            <Modal.Header closeButton>
              <Modal.Title className="fw-bold">
                {selectedWasher.name}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Row>
                <Col md={6}>
                  {/* Imagen */}
                  <div 
                    className="bg-light rounded mb-3"
                    style={{ 
                      height: '200px', 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {getTypeIcon(selectedWasher.type)}
                    <span className="ms-2 fw-bold">{getTypeBadge(selectedWasher.type).label}</span>
                  </div>

                  {/* Información básica */}
                  <div className="mb-4">
                    <div className="d-flex align-items-center mb-2">
                      <MapPin size={18} className="text-primary me-2" />
                      <strong>Ubicación:</strong>
                      <span className="ms-2">{selectedWasher.location}</span>
                    </div>
                    
                    <div className="d-flex align-items-center mb-2">
                      <DollarSign size={18} className="text-primary me-2" />
                      <strong>Precio:</strong>
                      <span className="ms-2 text-primary fw-bold fs-5">
                        ${selectedWasher.price} COP/h
                      </span>
                    </div>

                    <div className="d-flex align-items-center mb-2">
                      <Users size={18} className="text-primary me-2" />
                      <strong>Disponibilidad:</strong>
                      <Badge 
                        bg={getStatusBadge(selectedWasher.status, selectedWasher.available).variant}
                        className="ms-2"
                      >
                        {getStatusBadge(selectedWasher.status, selectedWasher.available).label}
                      </Badge>
                    </div>

                    {renderStars(selectedWasher.rating)}
                    <small className="text-muted">({selectedWasher.reviews} reviews)</small>
                  </div>
                </Col>

                <Col md={6}>
                  {/* Descripción */}
                  <h6 className="fw-bold">Descripción</h6>
                  <p className="text-muted mb-4">{selectedWasher.description}</p>

                  {/* Especificaciones */}
                  <h6 className="fw-bold">Especificaciones</h6>
                  <Row className="mb-4">
                    <Col sm={6}>
                      <div className="mb-2">
                        <small className="text-muted">Capacidad</small>
                        <div className="fw-bold">{selectedWasher.specifications.capacity}</div>
                      </div>
                    </Col>
                    <Col sm={6}>
                      <div className="mb-2">
                        <small className="text-muted">Programas</small>
                        <div className="fw-bold">{selectedWasher.specifications.programs}</div>
                      </div>
                    </Col>
                    <Col sm={6}>
                      <div className="mb-2">
                        <small className="text-muted">Clase energética</small>
                        <div className="fw-bold">{selectedWasher.specifications.energyClass}</div>
                      </div>
                    </Col>
                    <Col sm={6}>
                      <div className="mb-2">
                        <small className="text-muted">Velocidad</small>
                        <div className="fw-bold">{selectedWasher.specifications.speed}</div>
                      </div>
                    </Col>
                  </Row>

                  {/* Características */}
                  <h6 className="fw-bold">Características</h6>
                  <div className="mb-4">
                    {selectedWasher.features.map((feature, index) => (
                      <div key={index} className="d-flex align-items-center mb-2">
                        <CheckCircle size={16} className="text-success me-2" />
                        <small>{feature}</small>
                      </div>
                    ))}
                  </div>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button 
                variant="outline-secondary"
                onClick={() => setShowDetailModal(false)}
              >
                Cancelar
              </Button>
              <Button 
                variant="primary"
                disabled={selectedWasher.status === 'maintenance' || selectedWasher.available === 0}
                onClick={() => {
                  setShowDetailModal(false);
                  window.location.href = `/cliente/agendar?washer=${selectedWasher.id}`;
                }}
              >
                Reservar Esta Lavadora
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </Container>
  );
}