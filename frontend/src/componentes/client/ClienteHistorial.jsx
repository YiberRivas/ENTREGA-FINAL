import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Spinner, Badge, Button } from 'react-bootstrap';
import api from "../../api/axiosConfig";
import Swal from "sweetalert2";

// ⚠️ Lógica MOCK de Autenticación - REEMPLAZAR
const useAuth = () => ({ personaId: 1 }); // Mismo mock que usamos en MisAgendamientosCliente
// ***************************************************************

const ClienteHistorial = () => {
    const { personaId } = useAuth();
    const [historial, setHistorial] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistorial = async () => {
            if (!personaId) return;

            try {
                // Idealmente, usar un endpoint filtrado por estado (ej: /agendamientos/historial?persona_id=X)
                const resAgendamientos = await api.get("/agendamientos/"); 
                
                const serviciosFinalizados = (resAgendamientos.data || [])
                    .filter(ag => ag.persona_id === personaId && ["finalizado", "pagada", "cancelado"].includes(String(ag.estado)));
                
                setHistorial(serviciosFinalizados);
            } catch (error) {
                Swal.fire("Error", "No se pudo cargar el historial de servicios.", "error");
                console.error("Fetch Historial Error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistorial();
    }, [personaId]);

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
                <h2 className="mb-4 text-secondary fw-bold"><i className="fas fa-history me-2"></i> Historial de Servicios</h2>
                <Card className="shadow-sm">
                    <Card.Body>
                        <div className="table-responsive">
                            <Table striped bordered hover className="align-middle text-center mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>ID</th>
                                        <th>Servicio</th>
                                        <th>Fecha</th>
                                        <th>Estado Final</th>
                                        <th>Total</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {historial.length === 0 ? (
                                        <tr><td colSpan="6" className="text-muted py-4">No hay servicios en el historial.</td></tr>
                                    ) : historial.map((row) => (
                                        <tr key={row.id_agendamiento}>
                                            <td className="fw-bold">#{row.id_agendamiento}</td>
                                            <td>{row.servicio?.nombre_servicio || 'N/A'}</td>
                                            <td>{row.fecha}</td>
                                            <td>
                                                <Badge bg={row.estado === "finalizado" ? "success" : row.estado === "cancelado" ? "danger" : "primary"}>
                                                    {row.estado.toUpperCase()}
                                                </Badge>
                                            </td>
                                            <td>${row.factura?.total || 'N/A'}</td>
                                            <td>
                                                <Button size="sm" variant="outline-info" disabled><i className="fas fa-file-invoice me-1"></i> Ver Factura</Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
};

export default ClienteHistorial;