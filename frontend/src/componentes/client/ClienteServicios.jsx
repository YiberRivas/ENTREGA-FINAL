import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Spinner, Button } from 'react-bootstrap';
import api from "../../api/axiosConfig";
import Swal from "sweetalert2";
import { useNavigate } from 'react-router-dom';

const ClienteServicios = () => {
    const [servicios, setServicios] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchServicios = async () => {
            try {
                const response = await api.get('/servicios/');
                setServicios(response.data || []);
            } catch (error) {
                Swal.fire("Error", "No se pudieron cargar el catálogo de servicios.", "error");
                console.error("Fetch Servicios Error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchServicios();
    }, []);

    if (loading) {
        return (
            <div className="p-4 flex-grow-1 d-flex justify-content-center align-items-center">
                <Spinner animation="border" variant="info" />
            </div>
        );
    }

    return (
        <div className="p-4 flex-grow-1" style={{ background: "#f8f9fa" }}>
            <Container fluid>
                <h2 className="mb-4 text-info fw-bold"><i className="fas fa-cogs me-2"></i> Nuestro Catálogo de Servicios</h2>
                <p className="lead text-muted">Explora y selecciona el servicio que necesitas para tu electrodoméstico.</p>
                
                <Row>
                    {servicios.map((s) => (
                        <Col md={4} key={s.id_servicio ?? s.id} className="mb-4">
                            <Card className="shadow-sm h-100">
                                <Card.Body>
                                    <Card.Title className="fw-bold text-success">{s.nombre_servicio}</Card.Title>
                                    <Card.Text>{s.descripcion || "Servicio profesional de reparación y mantenimiento."}</Card.Text>
                                    <ul className="list-unstyled mt-3">
                                        <li><i className="fas fa-dollar-sign me-2 text-muted"></i> Precio Base: <strong>${s.precio_base}</strong></li>
                                        <li><i className="fas fa-hourglass-half me-2 text-muted"></i> Duración Estimada: <strong>{s.duracion_minutos} minutos</strong></li>
                                    </ul>
                                    <Button variant="primary" onClick={() => navigate('/cliente/agendar', { state: { servicioId: s.id_servicio ?? s.id } })}>
                                        <i className="fas fa-calendar-alt me-1"></i> Agendar Ahora
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
                {servicios.length === 0 && <p className="text-center text-muted mt-5">No hay servicios disponibles en este momento.</p>}
            </Container>
        </div>
    );
};

export default ClienteServicios;