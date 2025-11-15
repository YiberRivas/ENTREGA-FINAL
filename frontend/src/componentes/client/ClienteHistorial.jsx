// client/client/ClienteHistorial.jsx
import { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Form, 
  Badge,
  Button,
  Table,
  Pagination,
  Modal,
  Alert
} from 'react-bootstrap';
import { 
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Star,
  Filter,
  Download,
  Eye,
  RefreshCw,
  XCircle,
  CheckCircle,
  AlertCircle,
  Search,
  BarChart3
} from 'lucide-react';



export default function ClienteHistorial() {
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Estados para filtros
  const [filters, setFilters] = useState({
    status: 'all',
    month: '',
    search: ''
  });

  // Estadísticas
  const [stats, setStats] = useState({
    totalReservations: 0,
    totalSpent: 0,
    totalHours: 0,
    averageRating: 0
  });

  // Datos de ejemplo del historial
  const reservationData = [
    {
      id: 1,
      washerName: "Samsung EcoBubble",
      location: "Centro Comercial Santafé",
      date: "2024-01-10",
      time: "14:00 - 16:00",
      duration: 2,
      totalPrice: 7000,
      status: "completed",
      rating: 5,
      review: "Excelente servicio, la lavadora funcionó perfectamente",
      specifications: {
        type: "Premium",
        capacity: "18kg",
        programs: 8
      },
      paymentMethod: "Visa terminada en 4321",
      transactionId: "TX-001234"
    },
    {
      id: 2,
      washerName: "LG SteamWasher",
      location: "Unicentro Bogotá", 
      date: "2024-01-08",
      time: "10:00 - 11:00",
      duration: 1,
      totalPrice: 3800,
      status: "completed",
      rating: 4,
      review: "Buena lavadora, un poco ruidosa pero eficiente",
      specifications: {
        type: "Premium", 
        capacity: "17kg",
        programs: 6
      },
      paymentMethod: "Visa terminada en 4321",
      transactionId: "TX-001235"
    },
    {
      id: 3,
      washerName: "Whirlpool Ultimate Care",
      location: "Centro Comercial Andino",
      date: "2024-01-05", 
      time: "16:00 - 18:00",
      duration: 2,
      totalPrice: 6000,
      status: "completed",
      rating: 5,
      review: "Muy satisfecho con el servicio, volveré a usar",
      specifications: {
        type: "Estándar",
        capacity: "15kg", 
        programs: 6
      },
      paymentMethod: "Mastercard terminada en 8765",
      transactionId: "TX-001236"
    },
    {
      id: 4,
      washerName: "Miele Compact",
      location: "Plaza de las Américas",
      date: "2024-01-03",
      time: "09:00 - 10:00", 
      duration: 1,
      totalPrice: 2800,
      status: "completed",
      rating: 4,
      review: "Perfecta para mi apartamento pequeño",
      specifications: {
        type: "Compacta",
        capacity: "8kg",
        programs: 4
      },
      paymentMethod: "Visa terminada en 4321", 
      transactionId: "TX-001237"
    },
    {
      id: 5,
      washerName: "Bosch Silence",
      location: "Centro Comercial Santafé",
      date: "2024-01-15", 
      time: "13:00 - 14:00",
      duration: 1,
      totalPrice: 3200,
      status: "cancelled",
      cancellationReason: "Cambio de planes",
      specifications: {
        type: "Estándar",
        capacity: "14kg",
        programs: 5
      },
      paymentMethod: "Visa terminada en 4321",
      transactionId: "TX-001238"
    },
    {
      id: 6,
      washerName: "Haier Smart", 
      location: "Unicentro Bogotá",
      date: "2024-01-12",
      time: "15:00 - 17:00",
      duration: 2,
      totalPrice: 8000,
      status: "completed",
      rating: 5,
      review: "Increíble tecnología smart, muy fácil de usar",
      specifications: {
        type: "Premium",
        capacity: "20kg", 
        programs: 12
      },
      paymentMethod: "Visa terminada en 4321",
      transactionId: "TX-001239"
    },
    {
      id: 7,
      washerName: "Samsung EcoBubble",
      location: "Centro Comercial Santafé",
      date: "2023-12-28", 
      time: "11:00 - 13:00",
      duration: 2,
      totalPrice: 7000,
      status: "completed",
      rating: 4,
      review: "Buen servicio, puntual y eficiente",
      specifications: {
        type: "Premium",
        capacity: "18kg",
        programs: 8
      },
      paymentMethod: "Mastercard terminada en 8765",
      transactionId: "TX-001240"
    },
    {
      id: 8,
      washerName: "Whirlpool Ultimate Care", 
      location: "Centro Comercial Andino",
      date: "2023-12-25",
      time: "10:00 - 12:00",
      duration: 2,
      totalPrice: 6000,
      status: "completed",
      rating: 5,
      review: "Perfecta para la ropa de navidad",
      specifications: {
        type: "Estándar",
        capacity: "15kg",
        programs: 6 
      },
      paymentMethod: "Visa terminada en 4321",
      transactionId: "TX-001241"
    }
  ];

  // Opciones de filtros
  const statusOptions = [
    { value: 'all', label: 'Todas las reservas' },
    { value: 'completed', label: 'Completadas' },
    { value: 'cancelled', label: 'Canceladas' },
    { value: 'upcoming', label: 'Próximas' }
  ];

  // Inicializar datos
  useEffect(() => {
    setReservations(reservationData);
    setFilteredReservations(reservationData);
    calculateStats(reservationData);
  }, []);

  // Calcular estadísticas
  const calculateStats = (data) => {
    const totalReservations = data.length;
    const totalSpent = data
      .filter(item => item.status === 'completed')
      .reduce((sum, item) => sum + item.totalPrice, 0);
    const totalHours = data
      .filter(item => item.status === 'completed')
      .reduce((sum, item) => sum + item.duration, 0);
    const completedWithRating = data.filter(item => item.rating);
    const averageRating = completedWithRating.length > 0 
      ? completedWithRating.reduce((sum, item) => sum + item.rating, 0) / completedWithRating.length
      : 0;

    setStats({
      totalReservations,
      totalSpent,
      totalHours,
      averageRating: Math.round(averageRating * 10) / 10
    });
  };

  // Aplicar filtros
  useEffect(() => {
    let result = reservations;

    // Filtro por estado
    if (filters.status !== 'all') {
      result = result.filter(reservation => reservation.status === filters.status);
    }

    // Filtro por mes
    if (filters.month) {
      result = result.filter(reservation => {
        const reservationDate = new Date(reservation.date);
        const filterDate = new Date(filters.month);
        return reservationDate.getMonth() === filterDate.getMonth() && 
               reservationDate.getFullYear() === filterDate.getFullYear();
      });
    }

    // Filtro de búsqueda
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(reservation =>
        reservation.washerName.toLowerCase().includes(searchLower) ||
        reservation.location.toLowerCase().includes(searchLower) ||
        reservation.transactionId.toLowerCase().includes(searchLower)
      );
    }

    setFilteredReservations(result);
    calculateStats(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [filters, reservations]);

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredReservations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleViewDetails = (reservation) => {
    setSelectedReservation(reservation);
    setShowDetailModal(true);
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'cancelled': return 'danger';
      case 'upcoming': return 'warning';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle size={16} />;
      case 'cancelled': return <XCircle size={16} />;
      case 'upcoming': return <Clock size={16} />;
      default: return <AlertCircle size={16} />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      case 'upcoming': return 'Próxima';
      default: return status;
    }
  };

  const renderStars = (rating) => {
    if (!rating) return null;
    
    return (
      <div className="d-flex align-items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            className={star <= rating ? 'text-warning fill-warning' : 'text-muted'}
            fill={star <= rating ? 'currentColor' : 'none'}
          />
        ))}
      </div>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const exportToCSV = () => {
    // En una implementación real, esto generaría un archivo CSV
    alert('Funcionalidad de exportación a CSV pronto disponible');
  };

  return (
    <Container fluid>
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="text-center">
            <h1 className="fw-bold mb-3">Historial de Reservas</h1>
            <p className="text-muted fs-5">
              Revisa todas tus reservas anteriores y su estado
            </p>
          </div>
        </Col>
      </Row>

      {/* Estadísticas */}
      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <Row className="g-3">
                <Col md={3} sm={6}>
                  <Card className="border-0 bg-light h-100">
                    <Card.Body className="text-center">
                      <div className="bg-primary rounded p-3 mx-auto mb-3" style={{ width: '60px' }}>
                        <Calendar className="text-white" size={24} />
                      </div>
                      <h3 className="fw-bold text-primary">{stats.totalReservations}</h3>
                      <p className="text-muted mb-0">Total Reservas</p>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={3} sm={6}>
                  <Card className="border-0 bg-light h-100">
                    <Card.Body className="text-center">
                      <div className="bg-success rounded p-3 mx-auto mb-3" style={{ width: '60px' }}>
                        <DollarSign className="text-white" size={24} />
                      </div>
                      <h3 className="fw-bold text-success">{formatCurrency(stats.totalSpent)}</h3>
                      <p className="text-muted mb-0">Total Gastado</p>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={3} sm={6}>
                  <Card className="border-0 bg-light h-100">
                    <Card.Body className="text-center">
                      <div className="bg-warning rounded p-3 mx-auto mb-3" style={{ width: '60px' }}>
                        <Clock className="text-white" size={24} />
                      </div>
                      <h3 className="fw-bold text-warning">{stats.totalHours}h</h3>
                      <p className="text-muted mb-0">Horas Totales</p>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={3} sm={6}>
                  <Card className="border-0 bg-light h-100">
                    <Card.Body className="text-center">
                      <div className="bg-info rounded p-3 mx-auto mb-3" style={{ width: '60px' }}>
                        <Star className="text-white" size={24} />
                      </div>
                      <h3 className="fw-bold text-info">{stats.averageRating}/5</h3>
                      <p className="text-muted mb-0">Rating Promedio</p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filtros y Controles */}
      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <Row className="g-3 align-items-end">
                {/* Búsqueda */}
                <Col md={4}>
                  <Form.Label className="fw-bold">Buscar en historial</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <Search size={18} />
                    </span>
                    <Form.Control
                      type="text"
                      placeholder="Lavadora, ubicación o ID de transacción..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                    />
                  </div>
                </Col>

                {/* Filtro por estado */}
                <Col md={3}>
                  <Form.Label className="fw-bold">Estado de reserva</Form.Label>
                  <Form.Select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                </Col>

                {/* Filtro por mes */}
                <Col md={3}>
                  <Form.Label className="fw-bold">Filtrar por mes</Form.Label>
                  <Form.Control
                    type="month"
                    value={filters.month}
                    onChange={(e) => handleFilterChange('month', e.target.value)}
                  />
                </Col>

                {/* Controles */}
                <Col md={2}>
                  <div className="d-flex gap-2">
                    <Button 
                      variant="outline-primary" 
                      onClick={exportToCSV}
                      className="flex-fill"
                    >
                      <Download size={18} />
                    </Button>
                    <Button 
                      variant="outline-secondary"
                      onClick={() => setFilters({
                        status: 'all',
                        month: '',
                        search: ''
                      })}
                      className="flex-fill"
                    >
                      <RefreshCw size={18} />
                    </Button>
                  </div>
                </Col>
              </Row>

              {/* Resumen de filtros */}
              <div className="mt-3">
                <small className="text-muted">
                  Mostrando {filteredReservations.length} de {reservations.length} reservas
                  {filters.status !== 'all' && ` • Estado: ${statusOptions.find(s => s.value === filters.status)?.label}`}
                  {filters.month && ` • Mes: ${new Date(filters.month).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}`}
                  {filters.search && ` • Búsqueda: "${filters.search}"`}
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tabla de Historial */}
      <Row>
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-0">
              {currentItems.length > 0 ? (
                <div className="table-responsive">
                  <Table hover className="mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th className="border-0">Reserva</th>
                        <th className="border-0">Ubicación</th>
                        <th className="border-0">Fecha y Hora</th>
                        <th className="border-0 text-center">Duración</th>
                        <th className="border-0 text-end">Total</th>
                        <th className="border-0 text-center">Estado</th>
                        <th className="border-0 text-center">Rating</th>
                        <th className="border-0 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.map((reservation) => (
                        <tr key={reservation.id} className="align-middle">
                          <td>
                            <div>
                              <strong>{reservation.washerName}</strong>
                              <br />
                              <small className="text-muted">
                                {reservation.specifications.type} • {reservation.specifications.capacity}
                              </small>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <MapPin size={16} className="text-primary me-1" />
                              <small>{reservation.location}</small>
                            </div>
                          </td>
                          <td>
                            <div>
                              <small>{formatDate(reservation.date)}</small>
                              <br />
                              <small className="text-muted">{reservation.time}</small>
                            </div>
                          </td>
                          <td className="text-center">
                            <Badge bg="light" text="dark">
                              {reservation.duration}h
                            </Badge>
                          </td>
                          <td className="text-end">
                            <strong className="text-primary">
                              {formatCurrency(reservation.totalPrice)}
                            </strong>
                          </td>
                          <td className="text-center">
                            <Badge bg={getStatusVariant(reservation.status)} className="d-flex align-items-center justify-content-center gap-1">
                              {getStatusIcon(reservation.status)}
                              {getStatusText(reservation.status)}
                            </Badge>
                          </td>
                          <td className="text-center">
                            {reservation.rating ? (
                              renderStars(reservation.rating)
                            ) : (
                              <small className="text-muted">-</small>
                            )}
                          </td>
                          <td className="text-center">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleViewDetails(reservation)}
                            >
                              <Eye size={16} />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-5">
                  <Filter size={48} className="text-muted mb-3" />
                  <h5 className="text-muted">No se encontraron reservas</h5>
                  <p className="text-muted">
                    {filters.status !== 'all' || filters.month || filters.search 
                      ? "Intenta ajustar los filtros para ver más resultados"
                      : "Aún no tienes reservas en tu historial"
                    }
                  </p>
                  {(filters.status !== 'all' || filters.month || filters.search) && (
                    <Button 
                      variant="outline-primary"
                      onClick={() => setFilters({
                        status: 'all',
                        month: '',
                        search: ''
                      })}
                    >
                      Limpiar filtros
                    </Button>
                  )}
                </div>
              )}
            </Card.Body>

            {/* Paginación */}
            {totalPages > 1 && (
              <Card.Footer className="bg-white border-0">
                <div className="d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredReservations.length)} de {filteredReservations.length} reservas
                  </small>
                  
                  <Pagination className="mb-0">
                    <Pagination.Prev 
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    />
                    {[...Array(totalPages)].map((_, index) => (
                      <Pagination.Item
                        key={index + 1}
                        active={index + 1 === currentPage}
                        onClick={() => setCurrentPage(index + 1)}
                      >
                        {index + 1}
                      </Pagination.Item>
                    ))}
                    <Pagination.Next 
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    />
                  </Pagination>
                </div>
              </Card.Footer>
            )}
          </Card>
        </Col>
      </Row>

      {/* Modal de Detalles de Reserva */}
      <Modal 
        show={showDetailModal} 
        onHide={() => setShowDetailModal(false)} 
        size="lg"
        centered
      >
        {selectedReservation && (
          <>
            <Modal.Header closeButton>
              <Modal.Title className="fw-bold">
                Detalles de la Reserva #{selectedReservation.transactionId}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Row>
                <Col md={6}>
                  {/* Información de la lavadora */}
                  <h6 className="fw-bold mb-3">Información del Servicio</h6>
                  <div className="mb-4">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Lavadora:</span>
                      <strong>{selectedReservation.washerName}</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Tipo:</span>
                      <strong>{selectedReservation.specifications.type}</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Capacidad:</span>
                      <strong>{selectedReservation.specifications.capacity}</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Programas:</span>
                      <strong>{selectedReservation.specifications.programs}</strong>
                    </div>
                  </div>

                  {/* Información de ubicación y fecha */}
                  <h6 className="fw-bold mb-3">Ubicación y Horario</h6>
                  <div className="mb-4">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Ubicación:</span>
                      <strong>{selectedReservation.location}</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Fecha:</span>
                      <strong>{formatDate(selectedReservation.date)}</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Horario:</span>
                      <strong>{selectedReservation.time}</strong>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Duración:</span>
                      <strong>{selectedReservation.duration} horas</strong>
                    </div>
                  </div>
                </Col>

                <Col md={6}>
                  {/* Información de pago y estado */}
                  <h6 className="fw-bold mb-3">Información de Pago</h6>
                  <div className="mb-4">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Total pagado:</span>
                      <strong className="text-primary fs-5">
                        {formatCurrency(selectedReservation.totalPrice)}
                      </strong>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Método de pago:</span>
                      <strong>{selectedReservation.paymentMethod}</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">ID de transacción:</span>
                      <strong>{selectedReservation.transactionId}</strong>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Estado:</span>
                      <Badge bg={getStatusVariant(selectedReservation.status)}>
                        {getStatusText(selectedReservation.status)}
                      </Badge>
                    </div>
                  </div>

                  {/* Información adicional */}
                  {selectedReservation.cancellationReason && (
                    <>
                      <h6 className="fw-bold mb-3">Información de Cancelación</h6>
                      <Alert variant="warning" className="mb-4">
                        <strong>Motivo:</strong> {selectedReservation.cancellationReason}
                      </Alert>
                    </>
                  )}

                  {selectedReservation.review && (
                    <>
                      <h6 className="fw-bold mb-3">Tu Reseña</h6>
                      <Card className="border-0 bg-light">
                        <Card.Body>
                          {selectedReservation.rating && (
                            <div className="mb-2">
                              {renderStars(selectedReservation.rating)}
                            </div>
                          )}
                          <p className="mb-0">{selectedReservation.review}</p>
                        </Card.Body>
                      </Card>
                    </>
                  )}
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button 
                variant="outline-secondary"
                onClick={() => setShowDetailModal(false)}
              >
                Cerrar
              </Button>
              {selectedReservation.status === 'completed' && !selectedReservation.review && (
                <Button variant="primary">
                  Dejar Reseña
                </Button>
              )}
            </Modal.Footer>
          </>
        )}
      </Modal>
    </Container>
  );
}