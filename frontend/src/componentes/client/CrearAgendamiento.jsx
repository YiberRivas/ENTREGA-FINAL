import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import Swal from "sweetalert2";
import api from "../../api/axiosConfig";

// ⚠️ Lógica MOCK de Autenticación - REEMPLAZAR
const useAuth = () => ({ 
    isAuthenticated: true, 
    personaId: 1, // ID MOCK - Asegúrate de obtener el ID real del cliente logueado
    clienteData: { // Datos MOCK del cliente logueado
        nombres: 'Cliente',
        apellidos: 'Demo',
        direccion: 'Calle Falsa 123'
    }
});
// ***************************************************************

const CrearAgendamiento = () => {
    const { personaId, clienteData } = useAuth();
    const location = useLocation();
    const servicioPreSeleccionadoId = location.state?.servicioId; 

    const [servicios, setServicios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingServicios, setLoadingServicios] = useState(true);

    const [formData, setFormData] = useState({
        servicio_id: servicioPreSeleccionadoId || "",
        direccion: clienteData.direccion || "",
        fecha: "",
        hora: "",
        observaciones: "",
    });

    useEffect(() => {
        const fetchServicios = async () => {
            try {
                const response = await api.get('/servicios/');
                setServicios(response.data || []);
            } catch (error) {
                Swal.fire("Error", "No se pudieron cargar los servicios.", "error");
            } finally {
                setLoadingServicios(false);
            }
        };
        fetchServicios();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!personaId || !formData.servicio_id || !formData.fecha || !formData.hora) {
            Swal.fire("Campos incompletos", "Completa los campos obligatorios", "warning");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                persona_id: personaId, // Usamos el ID del cliente logueado
                servicio_id: parseInt(formData.servicio_id),
                fecha: formData.fecha,
                hora: formData.hora,
                observaciones: formData.observaciones || null,
                // El backend debería asignar el estado inicial como 'pendiente' o 'confirmado'
            };
            await api.post("/agendamientos/", payload);
            Swal.fire("¡Éxito!", "Tu servicio ha sido agendado. Revisa 'Mis Servicios Activos'.", "success");
            
            // Limpiar formulario y quitar preselección
            setFormData({
                servicio_id: "",
                direccion: clienteData.direccion || "",
                fecha: "",
                hora: "",
                observaciones: "",
            });
        } catch (err) {
            console.error("handleSubmit:", err);
            Swal.fire("Error", err.response?.data?.detail || "No se pudo agendar el servicio", "error");
        } finally {
            setLoading(false);
        }
    };

    if (loadingServicios) {
        return (
             <div className="p-4 flex-grow-1 d-flex justify-content-center align-items-center">
                <Spinner animation="border" variant="info" />
            </div>
        );
    }


    return (
        <div className="p-4 flex-grow-1" style={{ background: "#f8f9fa" }}>
            <Container fluid>
                <h2 className="mb-4 text-primary fw-bold"><i className="fas fa-calendar-plus me-2"></i> Solicitar Nuevo Servicio</h2>
                
                <Alert variant="info" className="d-flex align-items-center">
                    <i className="fas fa-info-circle fs-4 me-3"></i>
                    <div>
                        Hola, <strong>{clienteData.nombres} {clienteData.apellidos}</strong>. Tu información se usará para el agendamiento.
                    </div>
                </Alert>

                <Card className="shadow-sm">
                    <Card.Body>
                        <Form onSubmit={handleSubmit}>

                            <Form.Group className="mb-3">
                                <Form.Label><i className="fas fa-cogs me-2 text-success"></i>Servicio *</Form.Label>
                                <Form.Select name="servicio_id" value={formData.servicio_id} onChange={handleChange} required>
                                    <option value="">-- Selecciona un servicio --</option>
                                    {servicios.map(s => (<option key={s.id_servicio ?? s.id} value={s.id_servicio ?? s.id}>{s.nombre_servicio} - ${s.precio_base} ({s.duracion_minutos} min)</option>))}
                                </Form.Select>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label><i className="fas fa-map-marker-alt me-2 text-danger"></i>Dirección del Servicio</Form.Label>
                                <Form.Control type="text" name="direccion" value={formData.direccion} onChange={handleChange} placeholder="Dirección del servicio" required />
                            </Form.Group>

                            <div className="row">
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label><i className="fas fa-calendar me-2 text-warning"></i>Fecha *</Form.Label>
                                        <Form.Control type="date" name="fecha" value={formData.fecha} onChange={handleChange} min={new Date().toISOString().split('T')[0]} required />
                                    </Form.Group>
                                </div>
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label><i className="fas fa-clock me-2 text-info"></i>Hora *</Form.Label>
                                        <Form.Control type="time" name="hora" value={formData.hora} onChange={handleChange} required />
                                    </Form.Group>
                                </div>
                            </div>

                            <Form.Group className="mb-3">
                                <Form.Label><i className="fas fa-comment me-2 text-secondary"></i>Observaciones (Opcional)</Form.Label>
                                <Form.Control as="textarea" rows={2} name="observaciones" value={formData.observaciones} onChange={handleChange} placeholder="Notas adicionales sobre tu lavadora o el problema..." />
                            </Form.Group>

                            <div className="text-end">
                                <Button type="submit" variant="info" className="text-white" disabled={loading}>
                                    {loading ? <><Spinner size="sm" className="me-2" />Enviando...</> : <><i className="fas fa-check me-2"></i>Solicitar Cita</>}
                                </Button>
                            </div>
                        </Form>
                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
};

export default CrearAgendamiento;