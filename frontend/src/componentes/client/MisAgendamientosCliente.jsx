import React, { useEffect, useState, useRef } from "react";
import { Container, Row, Col, Card, Button, Spinner, Table, Badge } from "react-bootstrap";
import Swal from "sweetalert2";
import api from "../../api/axiosConfig"; 
// ❌ IMPORTACIÓN REMOVIDA: ClienteSidebar no debe ser importado aquí, solo en ClienteLayout.

// ⚠️ Lógica MOCK de Autenticación - REEMPLAZAR
const useAuth = () => ({ 
    isAuthenticated: true, 
    personaId: 1 // ID MOCK - Asegúrate de obtener el ID real del cliente logueado
});
// ***************************************************************

const MisAgendamientosCliente = () => {
    const { personaId } = useAuth(); 
    const [loadingData, setLoadingData] = useState(true);
    const [agendamientos, setAgendamientos] = useState([]);
    const [refreshFlag, setRefreshFlag] = useState(0);

    useEffect(() => {
        if (personaId) {
            cargarDatos(personaId);
        } else {
            setLoadingData(false);
        }
    }, [refreshFlag, personaId]);

    const cargarDatos = async (id) => {
        setLoadingData(true);
        try {
            // Llama a todos o al endpoint filtrado por cliente (si existe)
            const resAgendamientos = await api.get("/agendamientos/"); 
            
            const todosLosAgendamientos = (resAgendamientos.data || []).map((ag) => ({
                id_agendamiento: ag.id_agendamiento ?? ag.id ?? ag.idAgendamiento,
                persona_id: ag.persona_id,
                servicio_id: ag.servicio_id,
                fecha: ag.fecha,
                hora: ag.hora,
                estado: ag.estado,
                observaciones: ag.observaciones,
                persona: ag.persona ?? {},
                servicio: ag.servicio ?? {},
            }));
            
            // Filtro en el frontend por el ID del cliente
            const misAgendamientos = todosLosAgendamientos.filter(ag => ag.persona_id === id);
            
            setAgendamientos(misAgendamientos);
        } catch (err) {
            console.error("Error cargarDatos:", err);
            Swal.fire("Error", "No se pudieron cargar sus agendamientos", "error");
        } finally {
            setLoadingData(false);
        }
    };

    const cancelarServicio = async (id) => {
        const agendamiento = agendamientos.find(a => a.id_agendamiento === id);
        if (agendamiento.estado === 'en_proceso') {
             Swal.fire("Advertencia", "No puedes cancelar un servicio que ya está 'en proceso'. Contacta al administrador.", "warning");
             return;
        }

        const confirm = await Swal.fire({ 
            title: "¿Cancelar Servicio?", 
            text: "Esta acción eliminará su agendamiento.", 
            icon: "warning", 
            showCancelButton: true, 
            confirmButtonText: "Sí, Cancelar", 
            cancelButtonText: "No", 
            confirmButtonColor: "#dc3545" 
        });
        if (!confirm.isConfirmed) return;
        
        try {
            await api.delete(`/agendamientos/${id}`);
            Swal.fire("Cancelado", "El agendamiento fue eliminado.", "success");
            setRefreshFlag((f) => f + 1);
        } catch (err) {
            console.error("cancelarServicio:", err);
            Swal.fire("Error", err.response?.data?.detail || "No se pudo cancelar el servicio", "error");
        }
    };

    const handleFinalizar = async (row) => {
        if (row.estado !== "en_proceso") {
            Swal.fire("Error", "Solo puedes finalizar servicios que están 'en_proceso' por el técnico.", "warning");
            return;
        }

        const confirm = await Swal.fire({
            title: "¿Confirmar Servicio Finalizado?",
            html: `Usted está confirmando que el servicio de **${row.servicio?.nombre_servicio}** ha sido completado satisfactoriamente.`,
            icon: "question", 
            showCancelButton: true, 
            confirmButtonText: "Sí, Confirmo", 
            cancelButtonText: "Aún no", 
            confirmButtonColor: "#28a745"
        });
        if (!confirm.isConfirmed) return;

        try {
            const payload = { 
                agendamiento_id: row.id_agendamiento, 
                observaciones: "Finalizado y confirmado por el cliente", 
                calificacion: null 
            }; 
            await api.post("/agendamientos/finalizar", payload); 
            
            Swal.fire("Servicio Finalizado", "Gracias por confirmar. El servicio ha sido marcado como completado.", "success");
            setRefreshFlag((f) => f + 1);
        } catch (err) {
            console.error("handleFinalizar:", err);
            Swal.fire("Error", err.response?.data?.detail || "No se pudo finalizar. Consulte al administrador.", "error");
        }
    };

    const activos = agendamientos.filter((a) => ["pendiente", "confirmado", "en_proceso"].includes(String(a.estado)));

    if (loadingData) {
        return (
            <div className="flex-grow-1 d-flex justify-content-center align-items-center">
                <Spinner animation="border" variant="info" />
                <p className="ms-3 text-muted">Cargando mis servicios...</p>
            </div>
        );
    }

    return (
        <div className="flex-grow-1 p-4" style={{ background: "#f8f9fa" }}>
            <Container fluid>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="text-primary fw-bold mb-0"><i className="fas fa-calendar-alt me-2"></i> Mis Agendamientos Activos</h4>
                    <Button variant="secondary" size="sm" onClick={() => setRefreshFlag(f => f + 1)}><i className="fas fa-sync-alt me-1"></i> Refrescar</Button>
                </div>

                <Row>
                    <Col lg={12} className="mx-auto">
                        <Card className="shadow-sm">
                            <Card.Body>
                                <Card.Title className="fw-bold mb-3">Servicios Pendientes ({activos.length})</Card.Title>
                                <div className="table-responsive">
                                    <Table bordered hover className="align-middle text-center mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th style={{ width: "60px" }}>ID</th>
                                                <th>Servicio</th>
                                                <th>Fecha / Hora</th>
                                                <th>Dirección</th>
                                                <th>Estado</th>
                                                <th style={{ width: "150px" }}>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {activos.length === 0 ? (
                                                <tr><td colSpan="6" className="text-muted py-4"><i className="fas fa-inbox fa-2x mb-2 d-block"></i>No tienes agendamientos activos</td></tr>
                                            ) : activos.map((row) => (
                                                <tr key={row.id_agendamiento}>
                                                    <td className="fw-bold">#{row.id_agendamiento}</td>
                                                    <td>{row.servicio?.nombre_servicio}</td>
                                                    <td><div>{row.fecha}</div><small className="text-muted">{row.hora}</small></td>
                                                    <td className="text-start">{row.persona?.direccion?.direccion_detalle || "N/A"}</td>
                                                    <td>
                                                        <Badge bg={row.estado === "pendiente" ? "secondary" : row.estado === "en_proceso" ? "info" : "warning"} style={{ fontSize: "0.85rem", padding: "0.4rem 0.6rem" }}>
                                                            {row.estado.replace('_', ' ').toUpperCase()}
                                                        </Badge>
                                                    </td>
                                                    <td>
                                                        <div className="d-flex justify-content-center gap-2">
                                                            <Button 
                                                                size="sm" 
                                                                variant="danger" 
                                                                onClick={() => cancelarServicio(row.id_agendamiento)} 
                                                                disabled={row.estado === 'en_proceso'} 
                                                                title="Cancelar Agendamiento">
                                                                <i className="fas fa-times me-1"></i> Cancelar
                                                            </Button>
                                                            
                                                            <Button 
                                                                size="sm" 
                                                                variant="success" 
                                                                onClick={() => handleFinalizar(row)} 
                                                                disabled={row.estado !== "en_proceso"} 
                                                                title="Confirmar Finalización">
                                                                <i className="fas fa-check me-1"></i> Finalizar
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default MisAgendamientosCliente;