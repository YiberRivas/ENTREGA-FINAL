import React from 'react';
import { Container, Card, Row, Col } from 'react-bootstrap';

const ClienteInicio = () => {
    return (
        <div className="p-4 flex-grow-1" style={{ background: "#f8f9fa" }}>
            <Container fluid>
                <h2 className="mb-4 text-primary fw-bold">👋 ¡Bienvenido al Portal de Clientes!</h2>
                <p className="lead text-muted">
                    Aquí puedes gestionar tus servicios, agendar nuevas citas y revisar tu historial.
                </p>

                <Row className="mt-5">
                    <Col md={4} className="mb-4">
                        <Card className="shadow-sm h-100 border-primary">
                            <Card.Body>
                                <div className="d-flex align-items-center">
                                    <i className="fas fa-list-alt fa-3x text-primary me-3"></i>
                                    <div>
                                        <Card.Title className="fw-bold">Servicios Activos</Card.Title>
                                        <Card.Text>Consulta, cancela o finaliza tus agendamientos en curso.</Card.Text>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4} className="mb-4">
                        <Card className="shadow-sm h-100 border-info">
                            <Card.Body>
                                <div className="d-flex align-items-center">
                                    <i className="fas fa-calendar-plus fa-3x text-info me-3"></i>
                                    <div>
                                        <Card.Title className="fw-bold">Solicitar Nuevo</Card.Title>
                                        <Card.Text>Agenda una nueva cita para tu lavadora o servicio.</Card.Text>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4} className="mb-4">
                        <Card className="shadow-sm h-100 border-secondary">
                            <Card.Body>
                                <div className="d-flex align-items-center">
                                    <i className="fas fa-history fa-3x text-secondary me-3"></i>
                                    <div>
                                        <Card.Title className="fw-bold">Historial</Card.Title>
                                        <Card.Text>Revisa todos los servicios finalizados y facturas anteriores.</Card.Text>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default ClienteInicio;