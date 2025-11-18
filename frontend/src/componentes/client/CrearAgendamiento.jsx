// src/pages/admin/Pagos.jsx - VERSIÓN CONECTADA AL BACKEND
import React, { useState, useEffect, useRef } from 'react';
import { Container, Card, Form, Button, Spinner, Alert, Table, Badge, Modal, Row, Col } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import Swal from "sweetalert2";
import api from "../../api/axiosConfig";
import jsPDF from "jspdf";
import "jspdf-autotable";
import QRCode from "qrcode";

// ⚠️ Lógica MOCK de Autenticación - REEMPLAZAR CON TU SISTEMA REAL
const useAuth = () => ({ 
    isAuthenticated: true, 
    personaId: 1, // ID MOCK - Obtener del contexto/localStorage
    clienteData: {
        nombres: 'Cliente',
        apellidos: 'nino',
        direccion: 'Calle Real 48#23',
        identificacion: '123456789'
    }
});
// ***************************************************************

// ============================================================================
// UTILIDADES DE PERSISTENCIA DE TIMERS (Para mostrar tiempo en vivo)
// ============================================================================
const STORAGE_KEY = "servilavadora_timers_cliente";

const cargarTimersDeStorage = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return {};
        
        const timers = JSON.parse(stored);
        const ahora = Date.now();
        
        // Recalcular segundos para timers que están corriendo
        Object.keys(timers).forEach(key => {
            const timer = timers[key];
            if (timer.estado === "corriendo" && timer.inicioTimestamp) {
                const tiempoTranscurrido = Math.floor((ahora - timer.inicioTimestamp) / 1000);
                timer.segundos = tiempoTranscurrido;
            }
        });
        
        return timers;
    } catch (err) {
        console.error("Error al cargar timers:", err);
        return {};
    }
};

const guardarTimersEnStorage = (timers) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(timers));
    } catch (err) {
        console.error("Error al guardar timers:", err);
    }
};

const limpiarTimerDeStorage = (id) => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return;
        
        const timers = JSON.parse(stored);
        delete timers[id];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(timers));
    } catch (err) {
        console.error("Error al limpiar timer:", err);
    }
};

const LOGO_URL = "/Logo-Serv.png";
const METODOS_PAGO = [
  { id: 1, nombre: "Efectivo" },
  { id: 2, nombre: "Tarjeta" },
  { id: 26, nombre: "PSE" },
  { id: 27, nombre: "Nequi/Daviplata" },
];

// Información de cuenta para pagos
const NUMERO_CUENTA = "3001234567"; // ⚠️ CAMBIAR POR TU NÚMERO REAL
const NOMBRE_TITULAR = "SERVILAVADORA S.A.S";

const CrearAgendamiento = () => {
    const { personaId, clienteData } = useAuth();
    const location = useLocation();
    const servicioPreSeleccionadoId = location.state?.servicioId; 

    const [servicios, setServicios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingServicios, setLoadingServicios] = useState(true);
    const [agendamientos, setAgendamientos] = useState([]);
    const [loadingAgendamientos, setLoadingAgendamientos] = useState(true);
    const [refreshFlag, setRefreshFlag] = useState(0);

    // Timers locales para mostrar tiempo en vivo
    const [timers, setTimers] = useState({});
    const intervalsRef = useRef({});

    const [formData, setFormData] = useState({
        servicio_id: servicioPreSeleccionadoId || "",
        direccion: clienteData.direccion || "",
        fecha: "",
        hora: "",
        observaciones: "",
    });

    // Modal de pago
    const [showPagoModal, setShowPagoModal] = useState(false);
    const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);
    const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState(METODOS_PAGO[0].id);
    const [procesandoPago, setProcesandoPago] = useState(false);
    const [qrPagoUrl, setQrPagoUrl] = useState(null);

    // ============================================================================
    // INICIALIZACIÓN Y CARGA DE TIMERS
    // ============================================================================
    useEffect(() => {
        const timersGuardados = cargarTimersDeStorage();
        setTimers(timersGuardados);

        // Reiniciar intervalos para timers activos
        Object.keys(timersGuardados).forEach(id => {
            if (timersGuardados[id].estado === "corriendo") {
                iniciarIntervalo(id);
            }
        });

        return () => {
            Object.values(intervalsRef.current).forEach(intervalId => clearInterval(intervalId));
            intervalsRef.current = {};
        };
    }, []);

    // Sincronizar timers con storage
    useEffect(() => {
        guardarTimersEnStorage(timers);
    }, [timers]);

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

    useEffect(() => {
        cargarMisAgendamientos();
    }, [refreshFlag]);

    // ============================================================================
    // FUNCIÓN PARA INICIAR INTERVALO DE TIMER
    // ============================================================================
    const iniciarIntervalo = (id) => {
        if (intervalsRef.current[id]) {
            clearInterval(intervalsRef.current[id]);
        }

        const intervalId = setInterval(() => {
            setTimers(prev => {
                const timer = prev[id];
                if (!timer || timer.estado !== "corriendo") {
                    clearInterval(intervalId);
                    delete intervalsRef.current[id];
                    return prev;
                }

                const tiempoTranscurrido = Math.floor((Date.now() - timer.inicioTimestamp) / 1000);
                return {
                    ...prev,
                    [id]: {
                        ...timer,
                        segundos: tiempoTranscurrido
                    }
                };
            });
        }, 1000);

        intervalsRef.current[id] = intervalId;
    };

    const cargarMisAgendamientos = async () => {
        setLoadingAgendamientos(true);
        try {
            const response = await api.get("/agendamientos/");
            const todosAgendamientos = response.data || [];

            // Filtrar solo los agendamientos del cliente logueado
            const misAgendamientos = todosAgendamientos.filter(
                ag => ag.persona_id === personaId
            ).map((ag) => {
                const id = ag.id_agendamiento ?? ag.id ?? ag.idAgendamiento;
                
                // Si el servicio está "en_proceso" y no tenemos timer, crearlo
                if (ag.estado === "en_proceso" && !timers[id]) {
                    const ahora = Date.now();
                    const nuevoTimer = {
                        segundos: ag.tiempo_transcurrido || 0,
                        inicioTimestamp: ahora - ((ag.tiempo_transcurrido || 0) * 1000),
                        estado: "corriendo"
                    };
                    setTimers(prev => ({ ...prev, [id]: nuevoTimer }));
                    iniciarIntervalo(id);
                }

                return {
                    id_agendamiento: id,
                    persona_id: ag.persona_id,
                    servicio_id: ag.servicio_id,
                    fecha: ag.fecha,
                    hora: ag.hora,
                    estado: ag.estado,
                    observaciones: ag.observaciones,
                    tiempo_transcurrido: ag.tiempo_transcurrido || null,
                    persona: ag.persona ?? {},
                    servicio: ag.servicio ?? {},
                };
            });

            setAgendamientos(misAgendamientos);
        } catch (err) {
            console.error("Error al cargar agendamientos:", err);
        } finally {
            setLoadingAgendamientos(false);
        }
    };

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
                persona_id: personaId,
                servicio_id: parseInt(formData.servicio_id),
                fecha: formData.fecha,
                hora: formData.hora,
                observaciones: formData.observaciones || null,
            };
            await api.post("/agendamientos/", payload);
            
            Swal.fire({
                icon: "success",
                title: "¡Éxito!",
                text: "Tu servicio ha sido agendado correctamente",
                timer: 1500,
                showConfirmButton: false
            });
            
            // Limpiar solo los campos del servicio
            setFormData(prev => ({
                ...prev,
                servicio_id: "",
                fecha: "",
                hora: "",
                observaciones: "",
            }));

            // Recargar lista de agendamientos
            setRefreshFlag(f => f + 1);
        } catch (err) {
            console.error("handleSubmit:", err);
            Swal.fire("Error", err.response?.data?.detail || "No se pudo agendar el servicio", "error");
        } finally {
            setLoading(false);
        }
    };

    const cancelarServicio = async (id) => {
        const confirm = await Swal.fire({
            title: "¿Cancelar servicio?",
            text: "Esta acción eliminará tu agendamiento",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, cancelar",
            cancelButtonText: "No",
            confirmButtonColor: "#dc3545"
        });
        
        if (!confirm.isConfirmed) return;

        try {
            // Limpiar intervalo si existe
            if (intervalsRef.current[id]) {
                clearInterval(intervalsRef.current[id]);
                delete intervalsRef.current[id];
            }

            await api.delete(`/agendamientos/${id}`);

            // Eliminar timer
            setTimers(prev => {
                const copy = { ...prev };
                delete copy[id];
                return copy;
            });
            limpiarTimerDeStorage(id);

            Swal.fire({
                icon: "success",
                title: "Cancelado",
                text: "Tu servicio fue cancelado exitosamente.",
                timer: 1500,
                showConfirmButton: false
            });

            setRefreshFlag(f => f + 1);
        } catch (err) {
            console.error("cancelarServicio:", err);
            Swal.fire("Error", "No se pudo cancelar el servicio", "error");
        }
    };

    const handleFinalizar = async (row) => {
        const tiempoData = timers[row.id_agendamiento];
        const tiempoTranscurrido = tiempoData?.segundos || row.tiempo_transcurrido || 0;
        const minutos = Math.floor(tiempoTranscurrido / 60);
        const segundos = tiempoTranscurrido % 60;

        const confirm = await Swal.fire({
            title: "¿Finalizar servicio?",
            html: `<p>¿Confirmas que el servicio de <strong>${row.servicio?.nombre_servicio}</strong> ha sido completado?</p><p>Tiempo: <strong>${minutos}m ${segundos}s</strong></p><p>Esto generará automáticamente tu factura.</p>`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí, finalizar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#28a745"
        });
        
        if (!confirm.isConfirmed) return;

        try {
            // Limpiar intervalo si existe
            if (intervalsRef.current[row.id_agendamiento]) {
                clearInterval(intervalsRef.current[row.id_agendamiento]);
                delete intervalsRef.current[row.id_agendamiento];
            }

            const payload = {
                agendamiento_id: row.id_agendamiento,
                observaciones: row.observaciones || `Servicio completado - Tiempo: ${minutos}m ${segundos}s`,
                calificacion: null
            };

            const res = await api.post("/agendamientos/finalizar", payload);
            const data = res.data || {};
            const factura = data.factura ?? {};
            const cliente = data.cliente ?? row.persona ?? clienteData;
            const servicio = data.servicio ?? row.servicio ?? {};

            // Eliminar timer
            setTimers(prev => {
                const copy = { ...prev };
                delete copy[row.id_agendamiento];
                return copy;
            });
            limpiarTimerDeStorage(row.id_agendamiento);

            // Abrir modal de pago con la factura recién creada
            setFacturaSeleccionada({ factura, cliente, servicio });
            setMetodoPagoSeleccionado(METODOS_PAGO[0].id);
            setQrPagoUrl(null);
            setShowPagoModal(true);

            setRefreshFlag(f => f + 1);
        } catch (err) {
            console.error("handleFinalizar:", err);
            Swal.fire("Error", err.response?.data?.detail || "No se pudo finalizar el servicio", "error");
        }
    };

    const handleMetodoPagoChange = async (nuevoMetodo) => {
        setMetodoPagoSeleccionado(parseInt(nuevoMetodo));
        
        // Si es Nequi/Daviplata (ID 4), generar QR
        if (parseInt(nuevoMetodo) === 4 && facturaSeleccionada?.factura) {
            try {
                const total = facturaSeleccionada.factura.total;
                const datosQR = `${NUMERO_CUENTA}|${NOMBRE_TITULAR}|${total}`;
                const qrUrl = await QRCode.toDataURL(datosQR, { 
                    width: 300,
                    margin: 2,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF'
                    }
                });
                setQrPagoUrl(qrUrl);
            } catch (err) {
                console.error("Error generando QR:", err);
                setQrPagoUrl(null);
            }
        } else {
            setQrPagoUrl(null);
        }
    };

    const procesarPago = async () => {
        if (!facturaSeleccionada?.factura?.id_factura) {
            Swal.fire("Error", "Factura no encontrada", "error");
            return;
        }

        setProcesandoPago(true);
        const idFactura = facturaSeleccionada.factura.id_factura;
        const forma_pago_id = metodoPagoSeleccionado;

        try {
            try {
                await api.post("/pagos/", {
                    factura_id: idFactura,
                    forma_pago_id,
                    total: facturaSeleccionada.factura.total
                });
                await api.put(`/facturas/${idFactura}/estado?nuevo_estado=pagada`);

                Swal.fire({
                    icon: "success",
                    title: "Pago registrado",
                    text: "Tu pago fue registrado correctamente",
                    timer: 1500,
                    showConfirmButton: false
                });

                setShowPagoModal(false);
                setFacturaSeleccionada(null);
                setQrPagoUrl(null);
                setRefreshFlag(f => f + 1);
                return;
            } catch (errPost) {
                console.warn("POST /pagos falló:", errPost);
            }

            try {
                await api.put(`/facturas/${idFactura}/estado?nuevo_estado=pagada&forma_pago_id=${forma_pago_id}`);
                
                Swal.fire({
                    icon: "success",
                    title: "Pago registrado",
                    text: "Tu pago fue registrado correctamente",
                    timer: 1500,
                    showConfirmButton: false
                });

                setShowPagoModal(false);
                setFacturaSeleccionada(null);
                setQrPagoUrl(null);
                setRefreshFlag(f => f + 1);
            } catch (errPut) {
                console.error("PUT /facturas falló:", errPut);
                Swal.fire("Error", "No se pudo registrar el pago. Contacta con soporte.", "error");
            }
        } finally {
            setProcesandoPago(false);
        }
    };

    const generarPDFFactura = async () => {
        if (!facturaSeleccionada?.factura) {
            Swal.fire("Error", "No hay factura disponible", "error");
            return;
        }

        const { factura, cliente, servicio } = facturaSeleccionada;
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text("SERVILAVADORA S.A.S", 15, 20);

        try {
            doc.addImage(LOGO_URL, "", 160, 10, 30, 30);
        } catch (err) {
            console.warn("No se pudo cargar el logo:", err);
        }

        doc.setFontSize(11);
        doc.text(`Factura N°: ${factura.id_factura}`, 15, 30);
        doc.text(`Fecha: ${factura.fecha ?? new Date().toLocaleString()}`, 15, 36);
        doc.text(`Estado: ${factura.estado ?? ""}`, 15, 42);
        doc.text("Cliente:", 15, 52);
        doc.text(`${cliente.nombres ?? ""} ${cliente.apellidos ?? ""}`, 15, 58);
        doc.text(`Identificación: ${cliente.identificacion ?? ""}`, 15, 64);

        doc.autoTable({
            startY: 80,
            head: [["Servicio", "Precio"]],
            body: [[
                servicio.nombre_servicio ?? "Servicio",
                `$${servicio.precio_base ?? factura.total ?? 0}`
            ]]
        });

        const finalY = doc.lastAutoTable?.finalY ?? 120;
        doc.setFontSize(14);
        doc.text(`Total: $${factura.total ?? 0}`, 15, finalY + 12);

        try {
            const qr = await QRCode.toDataURL(`${window.location.origin}/facturas/ver/${factura.id_factura}`);
            doc.addImage(qr, "PNG", 160, finalY + 20, 30, 30);
        } catch (err) {
            console.warn("No se pudo generar QR:", err);
        }

        doc.save(`Factura_${factura.id_factura}.pdf`);
    };

    const formatearTiempo = (id) => {
        // Priorizar el timer local si existe
        const timer = timers[id];
        if (timer && timer.segundos !== undefined) {
            const mins = Math.floor(timer.segundos / 60);
            const secs = timer.segundos % 60;
            return `${mins}m ${secs}s`;
        }
        
        // Buscar el agendamiento y usar tiempo_transcurrido
        const agendamiento = agendamientos.find(a => a.id_agendamiento === id);
        if (agendamiento && agendamiento.tiempo_transcurrido) {
            const mins = Math.floor(agendamiento.tiempo_transcurrido / 60);
            const secs = agendamiento.tiempo_transcurrido % 60;
            return `${mins}m ${secs}s`;
        }
        
        return "0m 0s";
    };

    // Separar agendamientos por estado
    const activos = agendamientos.filter(a => 
        ["pendiente", "confirmado", "en_proceso"].includes(String(a.estado))
    );
    
    const completados = agendamientos.filter(a => 
        ["finalizado", "completado"].includes(String(a.estado))
    );

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
                <h2 className="mb-4 text-primary fw-bold">
                    <i className="fas fa-calendar-plus me-2"></i> Mis Servicios
                </h2>
                
                <Alert variant="info" className="d-flex align-items-center">
                    <i className="fas fa-info-circle fs-4 me-3"></i>
                    <div>
                        Hola, <strong>{clienteData.nombres} {clienteData.apellidos}</strong>. Aquí puedes solicitar nuevos servicios y ver tus servicios activos.
                    </div>
                </Alert>

                <Row>
                    <Col lg={12} xl={5} className="mb-4">
                        {/* FORMULARIO DE NUEVO AGENDAMIENTO */}
                        <Card className="shadow-sm h-100">
                            <Card.Body>
                                <Card.Title className="text-success fw-bold mb-3">
                                    <i className="fas fa-plus-circle me-2"></i>
                                    Solicitar Nuevo Servicio
                                </Card.Title>
                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>
                                            <i className="fas fa-cogs me-2 text-success"></i>Servicio *
                                        </Form.Label>
                                        <Form.Select 
                                            name="servicio_id" 
                                            value={formData.servicio_id} 
                                            onChange={handleChange} 
                                            required
                                        >
                                            <option value="">-- Selecciona un servicio --</option>
                                            {servicios.map(s => (
                                                <option key={s.id_servicio ?? s.id} value={s.id_servicio ?? s.id}>
                                                    {s.nombre_servicio} - ${s.precio_base} ({s.duracion_minutos} min)
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>
                                            <i className="fas fa-map-marker-alt me-2 text-danger"></i>
                                            Dirección del Servicio *
                                        </Form.Label>
                                        <Form.Control 
                                            type="text" 
                                            name="direccion" 
                                            value={formData.direccion} 
                                            onChange={handleChange} 
                                            placeholder="Dirección del servicio" 
                                            required 
                                        />
                                    </Form.Group>

                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>
                                                    <i className="fas fa-calendar me-2 text-warning"></i>Fecha *
                                                </Form.Label>
                                                <Form.Control 
                                                    type="date" 
                                                    name="fecha" 
                                                    value={formData.fecha} 
                                                    onChange={handleChange} 
                                                    min={new Date().toISOString().split('T')[0]} 
                                                    required 
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>
                                                    <i className="fas fa-clock me-2 text-info"></i>Hora *
                                                </Form.Label>
                                                <Form.Control 
                                                    type="time" 
                                                    name="hora" 
                                                    value={formData.hora} 
                                                    onChange={handleChange} 
                                                    required 
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Form.Group className="mb-3">
                                        <Form.Label>
                                            <i className="fas fa-comment me-2 text-secondary"></i>
                                            Observaciones (Opcional)
                                        </Form.Label>
                                        <Form.Control 
                                            as="textarea" 
                                            rows={2} 
                                            name="observaciones" 
                                            value={formData.observaciones} 
                                            onChange={handleChange} 
                                            placeholder="Notas adicionales sobre tu lavadora o el problema..." 
                                        />
                                    </Form.Group>

                                    <div className="text-end">
                                        <Button type="submit" variant="success" disabled={loading}>
                                            {loading ? (
                                                <>
                                                    <Spinner size="sm" className="me-2" />
                                                    Enviando...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-check me-2"></i>
                                                    Solicitar Cita
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col lg={12} xl={7}>
                        {/* SERVICIOS ACTIVOS */}
                        <Card className="shadow-sm mb-4">
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <Card.Title className="fw-bold mb-0 text-success">
                                        <i className="fas fa-clock me-2"></i>
                                        Servicios Activos ({activos.length})
                                    </Card.Title>
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        onClick={() => setRefreshFlag(f => f + 1)}
                                    >
                                        <i className="fas fa-sync-alt me-1"></i> Actualizar
                                    </Button>
                                </div>

                                {loadingAgendamientos ? (
                                    <div className="text-center py-4">
                                        <Spinner animation="border" variant="info" size="sm" />
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <Table bordered hover className="align-middle text-center mb-0">
                                            <thead className="table-light">
                                                <tr>
                                                    <th style={{ width: "40px" }}>#</th>
                                                    <th>Servicio</th>
                                                    <th>Fecha/Hora</th>
                                                    <th style={{ width: "100px" }}>Estado</th>
                                                    <th style={{ width: "100px" }}>Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {activos.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="5" className="text-muted py-4">
                                                            <i className="fas fa-inbox fa-2x mb-2 d-block"></i>
                                                            No tienes servicios activos
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    activos.map((row, index) => (
                                                        <tr key={row.id_agendamiento}>
                                                            <td className="fw-bold">{index + 1}</td>
                                                            <td className="text-start">
                                                                <small className="d-block fw-bold">
                                                                    {row.servicio?.nombre_servicio}
                                                                </small>
                                                                <small className="text-muted">
                                                                    ${row.servicio?.precio_base}
                                                                </small>
                                                            </td>
                                                            <td>
                                                                <small className="d-block">{row.fecha}</small>
                                                                <small className="text-muted">{row.hora}</small>
                                                            </td>
                                                            <td>
                                                                <Badge
                                                                    bg={
                                                                        row.estado === "pendiente"
                                                                            ? "secondary"
                                                                            : row.estado === "en_proceso"
                                                                            ? "info"
                                                                            : "warning"
                                                                    }
                                                                    style={{ fontSize: "0.75rem" }}
                                                                >
                                                                    {row.estado === "en_proceso" ? (
                                                                        <>⏱️ {formatearTiempo(row.id_agendamiento)}</>
                                                                    ) : (
                                                                        row.estado
                                                                    )}
                                                                </Badge>
                                                            </td>
                                                            <td>
                                                                <div className="d-flex justify-content-center gap-1">
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline-danger"
                                                                        onClick={() => cancelarServicio(row.id_agendamiento)}
                                                                        style={{ padding: "0.25rem 0.5rem" }}
                                                                        title="Cancelar"
                                                                    >
                                                                        <i className="fas fa-times"></i>
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline-success"
                                                                        onClick={() => handleFinalizar(row)}
                                                                        disabled={row.estado !== "en_proceso"}
                                                                        style={{ padding: "0.25rem 0.5rem" }}
                                                                        title="Finalizar"
                                                                    >
                                                                        <i className="fas fa-check"></i>
                                                                    </Button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </Table>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>

                        {/* HISTORIAL DE SERVICIOS */}
                        <Card className="shadow-sm">
                            <Card.Body>
                                <Card.Title className="fw-bold mb-3 text-primary">
                                    <i className="fas fa-check-circle me-2"></i>
                                    Historial ({completados.length})
                                </Card.Title>

                                {loadingAgendamientos ? (
                                    <div className="text-center py-4">
                                        <Spinner animation="border" variant="info" size="sm" />
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <Table bordered hover size="sm" className="align-middle text-center mb-0">
                                            <thead className="table-light">
                                                <tr>
                                                    <th style={{ width: "40px" }}>#</th>
                                                    <th>Servicio</th>
                                                    <th>Fecha</th>
                                                    <th>Tiempo</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {completados.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="4" className="text-muted py-3">
                                                            <small>No hay servicios completados</small>
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    completados.map((row, index) => (
                                                        <tr key={row.id_agendamiento}>
                                                            <td className="fw-bold">{index + 1}</td>
                                                            <td className="text-start">
                                                                <small>{row.servicio?.nombre_servicio}</small>
                                                            </td>
                                                            <td>
                                                                <small>{row.fecha}</small>
                                                            </td>
                                                            <td>
                                                                <small className="text-muted">
                                                                    {row.tiempo_transcurrido ? formatearTiempo(row.id_agendamiento) : "N/A"}
                                                                </small>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </Table>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* MODAL DE PAGO */}
            <Modal show={showPagoModal} onHide={() => setShowPagoModal(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        Realizar Pago - Factura #{facturaSeleccionada?.factura?.id_factura ?? "N/A"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="mb-3">
                        <strong>Servicio: </strong>
                        {facturaSeleccionada?.servicio?.nombre_servicio}
                    </div>
                    <div className="mb-4">
                        <strong>Total a pagar: </strong>
                        <span className="fs-4 text-success fw-bold">
                            ${facturaSeleccionada?.factura?.total ?? 0}
                        </span>
                    </div>

                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Método de pago</Form.Label>
                        <Form.Select
                            value={metodoPagoSeleccionado}
                            onChange={(e) => handleMetodoPagoChange(e.target.value)}
                        >
                            {METODOS_PAGO.map(m => (
                                <option key={m.id} value={m.id}>{m.nombre}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    {/* Información de cuenta */}
                    {(metodoPagoSeleccionado === 2 || metodoPagoSeleccionado === 3 || metodoPagoSeleccionado === 4) && (
                        <Card className="mb-3 border-info">
                            <Card.Body>
                                <h6 className="text-info mb-3">
                                    <i className="fas fa-university me-2"></i>
                                    Información de pago
                                </h6>
                                
                                <div className="mb-2">
                                    <strong>Nombre: </strong>
                                    <span className="text-muted">{NOMBRE_TITULAR}</span>
                                </div>
                                
                                <div className="mb-3">
                                    <strong>Número de cuenta: </strong>
                                    <div className="d-flex align-items-center gap-2 mt-1">
                                        <code className="bg-light p-2 rounded fs-5 flex-grow-1 text-center">
                                            {NUMERO_CUENTA}
                                        </code>
                                        <Button
                                            size="sm"
                                            variant="outline-info"
                                            onClick={() => {
                                                navigator.clipboard.writeText(NUMERO_CUENTA);
                                                Swal.fire({
                                                    icon: "success",
                                                    title: "¡Copiado!",
                                                    text: "Número copiado al portapapeles",
                                                    timer: 1000,
                                                    showConfirmButton: false
                                                });
                                            }}
                                            title="Copiar número"
                                        >
                                            <i className="fas fa-copy"></i>
                                        </Button>
                                    </div>
                                </div>

                                {/* QR Code para Nequi/Daviplata */}
                                {metodoPagoSeleccionado === 4 && qrPagoUrl && (
                                    <div className="text-center mt-3">
                                        <p className="text-muted mb-2">
                                            <i className="fas fa-mobile-alt me-2"></i>
                                            Escanea este código con tu app
                                        </p>
                                        <div className="d-flex justify-content-center">
                                            <img 
                                                src={qrPagoUrl} 
                                                alt="QR Code Nequi/Daviplata" 
                                                className="border rounded p-2"
                                                style={{ maxWidth: "250px" }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {metodoPagoSeleccionado === 3 && (
                                    <Alert variant="warning" className="mb-0 mt-2">
                                        <small>
                                            <i className="fas fa-info-circle me-1"></i>
                                            Usa este número para realizar la transferencia PSE
                                        </small>
                                    </Alert>
                                )}

                                {metodoPagoSeleccionado === 2 && (
                                    <Alert variant="info" className="mb-0 mt-2">
                                        <small>
                                            <i className="fas fa-credit-card me-1"></i>
                                            Procesa el pago con este número de cuenta
                                        </small>
                                    </Alert>
                                )}
                            </Card.Body>
                        </Card>
                    )}

                    {metodoPagoSeleccionado === 1 && (
                        <Alert variant="success">
                            <i className="fas fa-money-bill-wave me-2"></i>
                            Pago en <strong>efectivo</strong>. Paga al técnico al finalizar el servicio.
                        </Alert>
                    )}

                    <div className="d-flex gap-2 mt-4">
                        <Button 
                            variant="success" 
                            onClick={procesarPago} 
                            disabled={procesandoPago}
                            className="flex-grow-1"
                        >
                            {procesandoPago ? (
                                <>
                                    <Spinner size="sm" className="me-2" animation="border" />
                                    Procesando...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-check-circle me-2"></i>
                                    Confirmar Pago
                                </>
                            )}
                        </Button>
                        <Button 
                            variant="outline-secondary" 
                            onClick={() => generarPDFFactura()}
                        >
                            <i className="fas fa-file-pdf me-1"></i>
                            PDF
                        </Button>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => {
                        setShowPagoModal(false);
                        setQrPagoUrl(null);
                    }}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default CrearAgendamiento;