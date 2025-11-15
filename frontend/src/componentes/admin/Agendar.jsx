// src/pages/admin/Agendar.jsx
import React, { useEffect, useState, useRef } from "react";
import {
  Container, Row, Col, Card, Form, Button, Spinner, Alert, InputGroup, Table, Badge, Modal
} from "react-bootstrap";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Swal from "sweetalert2";
import api from "../../api/axiosConfig";
import AdminSidebar from "./AdminSidebar";
import RegistroCliente from "./RegistroCliente";
import QRCode from "qrcode";

/**
 * Agendar.jsx
 * - Requisitos:
 *   - logo público en public/Logo-Serv.png (o ajustar LOGO_URL)
 *   - endpoints backend: /personas/, /servicios/, /agendamientos/, /agendamientos/iniciar/{id},
 *     /agendamientos/finalizar, DELETE /agendamientos/{id}, PUT /facturas/{id}/estado, POST /pagos/ (opcional)
 */

const LOGO_URL = "/Logo-Serv.png";
const METODOS_PAGO = [
  { id: 1, nombre: "Efectivo" },
  { id: 2, nombre: "Tarjeta" },
  { id: 3, nombre: "PSE" },
  { id: 4, nombre: "Nequi/Daviplata" },
];

const Agendar = () => {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [buscandoCliente, setBuscandoCliente] = useState(false);
  const [showRegistroModal, setShowRegistroModal] = useState(false);

  const [formData, setFormData] = useState({
    persona_id: "",
    servicio_id: "",
    direccion: "",
    fecha: "",
    hora: "",
    observaciones: "",
  });

  const [cedula, setCedula] = useState("");
  const [clienteEncontrado, setClienteEncontrado] = useState(null);
  const [personas, setPersonas] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [agendamientos, setAgendamientos] = useState([]);
  const [refreshFlag, setRefreshFlag] = useState(0);

  const [timers, setTimers] = useState({});
  const intervalsRef = useRef({});

  // Pago modal
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);
  const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState(METODOS_PAGO[0].id);
  const [procesandoPago, setProcesandoPago] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, [refreshFlag]);

  useEffect(() => {
    return () => {
      Object.values(intervalsRef.current).forEach((id) => clearInterval(id));
      intervalsRef.current = {};
    };
  }, []);

  const cargarDatos = async () => {
    setLoadingData(true);
    try {
      const [resPersonas, resServicios, resAgendamientos] = await Promise.all([
        api.get("/personas/"),
        api.get("/servicios/"),
        api.get("/agendamientos/"),
      ]);

      setPersonas(resPersonas.data || []);
      setServicios(resServicios.data || []);

      const ags = (resAgendamientos.data || []).map((ag) => ({
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
      setAgendamientos(ags);
    } catch (err) {
      console.error("Error cargarDatos:", err);
      Swal.fire("Error", "No se pudieron cargar los datos necesarios", "error");
    } finally {
      setLoadingData(false);
    }
  };

  const buscarClientePorCedula = async () => {
    if (!cedula.trim()) {
      Swal.fire("Cédula requerida", "Por favor ingresa la cédula", "warning");
      return;
    }
    setBuscandoCliente(true);
    try {
      const persona = personas.find((p) => String(p.identificacion) === cedula.trim() || String(p.identificacion) === cedula.replace(/\D/g, ""));
      if (persona) {
        setClienteEncontrado(persona);
        setFormData((f) => ({ ...f, persona_id: persona.id_persona, direccion: persona.direccion?.direccion_detalle || "" }));
        Swal.fire({ icon: "success", title: "Cliente encontrado", html: `<strong>${persona.nombres} ${persona.apellidos}</strong><br/>${persona.correo || ""}`, timer: 1400, showConfirmButton: false });
      } else {
        setClienteEncontrado(null);
        setFormData((f) => ({ ...f, persona_id: "", direccion: "" }));
        const res = await Swal.fire({ title: "Cliente no encontrado", text: "No existe un cliente registrado con esta cédula", icon: "warning", showCancelButton: true, confirmButtonText: "Registrar Cliente", cancelButtonText: "Cancelar" });
        if (res.isConfirmed) setShowRegistroModal(true);
      }
    } catch (err) {
      console.error("buscarClientePorCedula:", err);
      Swal.fire("Error", "No se pudo buscar el cliente", "error");
    } finally {
      setBuscandoCliente(false);
    }
  };

  const handleClienteCreado = (nuevaPersona) => {
    setShowRegistroModal(false);
    if (nuevaPersona?.id_persona) {
      setClienteEncontrado(nuevaPersona);
      setFormData((f) => ({ ...f, persona_id: nuevaPersona.id_persona, direccion: nuevaPersona.direccion?.direccion_detalle || "" }));
      Swal.fire("Cliente registrado", "Se agregó correctamente", "success");
      setRefreshFlag((f) => f + 1);
    }
  };

  const limpiarBusqueda = () => {
    setCedula("");
    setClienteEncontrado(null);
    setFormData({ persona_id: "", servicio_id: "", direccion: "", fecha: "", hora: "", observaciones: "" });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.persona_id || !formData.servicio_id || !formData.fecha || !formData.hora) {
      Swal.fire("Campos incompletos", "Completa los campos obligatorios", "warning");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        persona_id: parseInt(formData.persona_id),
        servicio_id: parseInt(formData.servicio_id),
        fecha: formData.fecha,
        hora: formData.hora,
        observaciones: formData.observaciones || null,
      };
      await api.post("/agendamientos/", payload);
      Swal.fire("Éxito", "Agendamiento creado correctamente", "success");
      limpiarBusqueda();
      setRefreshFlag((f) => f + 1);
    } catch (err) {
      console.error("handleSubmit:", err);
      Swal.fire("Error", err.response?.data?.detail || "No se pudo crear el agendamiento", "error");
    } finally {
      setLoading(false);
    }
  };

  const iniciarTemporizador = async (id) => {
    const confirm = await Swal.fire({ title: "¿Iniciar servicio?", text: "Se iniciará el contador de tiempo", icon: "question", showCancelButton: true, confirmButtonText: "Sí, iniciar", cancelButtonText: "Cancelar" });
    if (!confirm.isConfirmed) return;
    try {
      await api.post(`/agendamientos/iniciar/${id}`);
      setTimers((prev) => ({ ...prev, [id]: prev[id] ?? 0 }));
      if (intervalsRef.current[id]) clearInterval(intervalsRef.current[id]);
      const intervalId = setInterval(() => {
        setTimers((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
      }, 1000);
      intervalsRef.current = { ...intervalsRef.current, [id]: intervalId };
      Swal.fire("Iniciado", "El servicio ha sido puesto en proceso.", "success");
      setRefreshFlag((f) => f + 1);
    } catch (err) {
      console.error("iniciarTemporizador:", err);
      Swal.fire("Error", err.response?.data?.detail || "No se pudo iniciar el servicio", "error");
    }
  };

  const pausarTemporizador = async (id) => {
    const confirm = await Swal.fire({ title: "¿Pausar servicio?", text: "El contador se detendrá", icon: "question", showCancelButton: true, confirmButtonText: "Sí, pausar", cancelButtonText: "Cancelar" });
    if (!confirm.isConfirmed) return;
    try {
      if (intervalsRef.current[id]) {
        clearInterval(intervalsRef.current[id]);
        delete intervalsRef.current[id];
      }
      try {
        await api.put(`/agendamientos/${id}/estado?nuevo_estado=pendiente`);
      } catch (err2) {
        console.warn("PUT estado no disponible:", err2);
      }
      Swal.fire("Pausado", "El servicio ha sido pausado localmente.", "success");
      setRefreshFlag((f) => f + 1);
    } catch (err) {
      console.error("pausarTemporizador:", err);
      Swal.fire("Error", "No se pudo pausar el servicio", "error");
    }
  };

  const cancelarServicio = async (id) => {
    const confirm = await Swal.fire({ title: "¿Cancelar servicio?", text: "Esta acción eliminará el agendamiento", icon: "warning", showCancelButton: true, confirmButtonText: "Sí, cancelar", cancelButtonText: "No", confirmButtonColor: "#dc3545" });
    if (!confirm.isConfirmed) return;
    try {
      if (intervalsRef.current[id]) {
        clearInterval(intervalsRef.current[id]);
        delete intervalsRef.current[id];
      }
      await api.delete(`/agendamientos/${id}`);
      setTimers((prev) => { const copy = { ...prev }; delete copy[id]; return copy; });
      Swal.fire("Cancelado", "El agendamiento fue eliminado.", "success");
      setRefreshFlag((f) => f + 1);
    } catch (err) {
      console.error("cancelarServicio:", err);
      Swal.fire("Error", "No se pudo cancelar el servicio", "error");
    }
  };

  const handleFinalizar = async (row) => {
    const tiempoTranscurrido = timers[row.id_agendamiento] || 0;
    const minutos = Math.floor(tiempoTranscurrido / 60);
    const segundos = tiempoTranscurrido % 60;
    const confirm = await Swal.fire({
      title: "¿Finalizar servicio?",
      html: `<p>Tiempo transcurrido: <strong>${minutos}m ${segundos}s</strong></p><p>Esto generará automáticamente la factura del servicio.</p>`,
      icon: "question", showCancelButton: true, confirmButtonText: "Sí, finalizar", cancelButtonText: "Cancelar", confirmButtonColor: "#28a745"
    });
    if (!confirm.isConfirmed) return;

    try {
      if (intervalsRef.current[row.id_agendamiento]) {
        clearInterval(intervalsRef.current[row.id_agendamiento]);
        delete intervalsRef.current[row.id_agendamiento];
      }
      const payload = { agendamiento_id: row.id_agendamiento, observaciones: `Tiempo: ${minutos}m ${segundos}s`, calificacion: null };
      const res = await api.post("/agendamientos/finalizar", payload);
      const data = res.data || {};
      const factura = data.factura ?? {};
      const cliente = data.cliente ?? row.persona ?? {};
      const servicio = data.servicio ?? row.servicio ?? {};

      // Abrir modal de pago con la factura recién creada
      setFacturaSeleccionada({ factura, cliente, servicio });
      setMetodoPagoSeleccionado(METODOS_PAGO[0].id);
      setShowPagoModal(true);

      setTimers((prev) => { const copy = { ...prev }; delete copy[row.id_agendamiento]; return copy; });
      setRefreshFlag((f) => f + 1);
    } catch (err) {
      console.error("handleFinalizar:", err);
      Swal.fire("Error", err.response?.data?.detail || "No se pudo finalizar", "error");
    }
  };

  const procesarPago = async () => {
    if (!facturaSeleccionada?.factura?.id_factura) {
      Swal.fire("Error", "Factura no encontrada para procesar pago", "error");
      return;
    }
    setProcesandoPago(true);
    const idFactura = facturaSeleccionada.factura.id_factura;
    const forma_pago_id = metodoPagoSeleccionado;

    try {
      // 1) Intentar POST /pagos/ (si existe)
      try {
        await api.post("/pagos/", { factura_id: idFactura, forma_pago_id, total: facturaSeleccionada.factura.total });
        await api.put(`/facturas/${idFactura}/estado?nuevo_estado=pagada`);
        Swal.fire("Pago registrado", "El pago fue registrado correctamente", "success");
        setShowPagoModal(false);
        setFacturaSeleccionada(null);
        setRefreshFlag(f => f + 1);
        return;
      } catch (errPost) {
        console.warn("POST /pagos falló:", errPost);
      }

      // 2) Fallback: PUT /facturas/{id}/estado?nuevo_estado=pagada&forma_pago_id=X
      try {
        await api.put(`/facturas/${idFactura}/estado?nuevo_estado=pagada&forma_pago_id=${forma_pago_id}`);
        Swal.fire("Pago registrado (fallback)", "Estado de la factura actualizado a 'pagada'", "success");
        setShowPagoModal(false);
        setFacturaSeleccionada(null);
        setRefreshFlag(f => f + 1);
      } catch (errPut) {
        console.error("PUT /facturas falló:", errPut);
        Swal.fire("Error", "No se pudo registrar el pago. Intenta desde el backend.", "error");
      }
    } finally {
      setProcesandoPago(false);
    }
  };

  const generarPDFFacturaSeleccionada = async () => {
    if (!facturaSeleccionada?.factura) {
      Swal.fire("Error", "No hay factura disponible", "error");
      return;
    }
    const { factura, cliente, servicio } = facturaSeleccionada;
    const doc = new jsPDF();
    doc.setFontSize(18); doc.text("SERVILAVADORA S.A.S", 15, 20);
    doc.setFontSize(11);
    doc.text(`Factura N°: ${factura.id_factura}`, 15, 30);
    doc.text(`Fecha: ${factura.fecha ?? new Date().toLocaleString()}`, 15, 36);
    doc.text(`Estado: ${factura.estado ?? ""}`, 15, 42);
    doc.text("Cliente:", 15, 52);
    doc.text(`${cliente.nombres ?? ""} ${cliente.apellidos ?? ""}`, 15, 58);
    doc.text(`Identificación: ${cliente.identificacion ?? ""}`, 15, 64);
    doc.text(`Correo: ${cliente.correo ?? ""}`, 15, 70);

    doc.autoTable({ startY: 80, head: [["Servicio", "Precio"]], body: [[servicio.nombre_servicio ?? "Servicio", `$${servicio.precio_base ?? factura.total ?? 0}`]] });
    const finalY = doc.lastAutoTable?.finalY ?? 120;
    doc.setFontSize(14); doc.text(`Total: $${factura.total ?? 0}`, 15, finalY + 12);

    try {
      const qr = await QRCode.toDataURL(`${window.location.origin}/facturas/ver/${factura.id_factura}`);
      doc.addImage(qr, "PNG", 160, finalY + 20, 30, 30);
    } catch (err) {
      console.warn("No se pudo generar QR:", err);
    }
    doc.save(`Factura_${factura.id_factura}.pdf`);
  };

  const formatearTiempo = (segundos) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const pendientes = agendamientos.filter((a) => ["pendiente", "confirmado", "en_proceso"].includes(String(a.estado)));

  if (loadingData) {
    return (
      <div className="d-flex" style={{ minHeight: "100vh" }}>
        <AdminSidebar />
        <div className="flex-grow-1 d-flex justify-content-center align-items-center">
          <Spinner animation="border" variant="info" />
          <p className="ms-3 text-muted">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <AdminSidebar />
      <div className="flex-grow-1 p-4" style={{ background: "#f8f9fa" }}>
        <Container fluid>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="text-info fw-bold mb-0"><i className="fas fa-calendar-plus me-2"></i> Agendar Servicio</h4>
            <div>
              <Button variant="success" size="sm" onClick={() => setShowRegistroModal(true)} className="me-2"><i className="fas fa-user-plus me-1"></i> Registrar Cliente</Button>
              <Button variant="secondary" size="sm" onClick={() => setRefreshFlag(f => f + 1)}><i className="fas fa-sync-alt me-1"></i> Refrescar</Button>
            </div>
          </div>

          <Row>
            <Col lg={10} className="mx-auto">
              <Card className="shadow-sm border-0 mb-4">
                <Card.Body>
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label><i className="fas fa-id-card me-2 text-primary"></i>Cédula del Cliente *</Form.Label>
                      <InputGroup>
                        <Form.Control type="text" placeholder="Número de cédula" value={cedula} onChange={(e) => setCedula(e.target.value)} onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); buscarClientePorCedula(); } }} />
                        <Button variant="info" onClick={buscarClientePorCedula} disabled={buscandoCliente}>{buscandoCliente ? <Spinner animation="border" size="sm" /> : <><i className="fas fa-search me-1"></i>Buscar</>}</Button>
                        {clienteEncontrado && (<Button variant="outline-secondary" onClick={limpiarBusqueda}><i className="fas fa-times"></i></Button>)}
                      </InputGroup>
                    </Form.Group>

                    {clienteEncontrado && (<Alert variant="success" className="d-flex align-items-center"><i className="fas fa-check-circle fs-4 me-3"></i><div><strong>{clienteEncontrado.nombres} {clienteEncontrado.apellidos}</strong><br /><small>{clienteEncontrado.correo} | {clienteEncontrado.telefono}</small></div></Alert>)}

                    <Form.Group className="mb-3">
                      <Form.Label><i className="fas fa-cogs me-2 text-success"></i>Servicio *</Form.Label>
                      <Form.Select name="servicio_id" value={formData.servicio_id} onChange={handleChange} disabled={!clienteEncontrado} required>
                        <option value="">-- Selecciona un servicio --</option>
                        {servicios.map(s => (<option key={s.id_servicio ?? s.id} value={s.id_servicio ?? s.id}>{s.nombre_servicio} - ${s.precio_base} ({s.duracion_minutos} min)</option>))}
                      </Form.Select>
                    </Form.Group>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label><i className="fas fa-calendar me-2 text-warning"></i>Fecha *</Form.Label>
                          <Form.Control type="date" name="fecha" value={formData.fecha} onChange={handleChange} min={new Date().toISOString().split('T')[0]} disabled={!clienteEncontrado} required />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label><i className="fas fa-clock me-2 text-info"></i>Hora *</Form.Label>
                          <Form.Control type="time" name="hora" value={formData.hora} onChange={handleChange} disabled={!clienteEncontrado} required />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label><i className="fas fa-map-marker-alt me-2 text-danger"></i>Dirección</Form.Label>
                      <Form.Control type="text" name="direccion" value={formData.direccion} onChange={handleChange} disabled={!clienteEncontrado} placeholder="Dirección del servicio" />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label><i className="fas fa-comment me-2 text-secondary"></i>Observaciones (Opcional)</Form.Label>
                      <Form.Control as="textarea" rows={2} name="observaciones" value={formData.observaciones} onChange={handleChange} disabled={!clienteEncontrado} placeholder="Notas adicionales..." />
                    </Form.Group>

                    <div className="text-end">
                      <Button type="submit" variant="info" className="text-white" disabled={loading || !clienteEncontrado}>
                        {loading ? <><Spinner size="sm" className="me-2" />Agendando...</> : <><i className="fas fa-check me-2"></i>Agendar Servicio</>}
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>

              <Card className="shadow-sm">
                <Card.Body>
                  <Card.Title className="fw-bold mb-3"><i className="fas fa-list me-2 text-info"></i>Agendamientos Activos ({pendientes.length})</Card.Title>
                  <div className="table-responsive">
                    <Table bordered hover className="align-middle text-center mb-0">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: "60px" }}>ID</th>
                          <th>Cliente</th>
                          <th>Servicio</th>
                          <th>Fecha / Hora</th>
                          <th style={{ width: "120px" }}>Estado</th>
                          <th style={{ width: "180px" }}>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendientes.length === 0 ? (
                          <tr><td colSpan="6" className="text-muted py-4"><i className="fas fa-inbox fa-2x mb-2 d-block"></i>No hay agendamientos activos</td></tr>
                        ) : pendientes.map((row) => (
                          <tr key={row.id_agendamiento}>
                            <td className="fw-bold">#{row.id_agendamiento}</td>
                            <td className="text-start"><i className="fas fa-user-circle me-2 text-muted"></i>{row.persona?.nombres} {row.persona?.apellidos}</td>
                            <td>{row.servicio?.nombre_servicio}</td>
                            <td><div><i className="fas fa-calendar me-1 text-muted"></i>{row.fecha}</div><small className="text-muted"><i className="fas fa-clock me-1"></i>{row.hora}</small></td>
                            <td>
                              <Badge bg={row.estado === "pendiente" ? "secondary" : row.estado === "en_proceso" ? "info" : row.estado === "finalizado" ? "success" : "warning"} style={{ fontSize: "0.85rem", padding: "0.4rem 0.6rem" }}>
                                {row.estado === "en_proceso" && timers[row.id_agendamiento] ? (<><i className="fas fa-clock me-1"></i>{formatearTiempo(timers[row.id_agendamiento])}</>) : row.estado}
                              </Badge>
                            </td>
                            <td>
                              <div className="d-flex justify-content-center gap-1">
                                <Button size="sm" variant="success" onClick={() => iniciarTemporizador(row.id_agendamiento)} disabled={row.estado === "en_proceso"} style={{ width: "36px", height: "36px", padding: 0 }} title="Iniciar"><i className="fas fa-play"></i></Button>
                                <Button size="sm" variant="warning" onClick={() => pausarTemporizador(row.id_agendamiento)} disabled={row.estado !== "en_proceso"} style={{ width: "36px", height: "36px", padding: 0 }} title="Pausar"><i className="fas fa-pause"></i></Button>
                                <Button size="sm" variant="danger" onClick={() => cancelarServicio(row.id_agendamiento)} style={{ width: "36px", height: "36px", padding: 0 }} title="Cancelar"><i className="fas fa-times"></i></Button>
                                <Button size="sm" variant="primary" onClick={() => handleFinalizar(row)} disabled={row.estado !== "en_proceso"} style={{ width: "36px", height: "36px", padding: 0 }} title="Finalizar"><i className="fas fa-check"></i></Button>
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

      <RegistroCliente show={showRegistroModal} onHide={() => setShowRegistroModal(false)} onCreated={handleClienteCreado} />

      <Modal show={showPagoModal} onHide={() => setShowPagoModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Registrar Pago - Factura #{facturaSeleccionada?.factura?.id_factura ?? "N/A"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3"><strong>Cliente: </strong> {facturaSeleccionada?.cliente?.nombres} {facturaSeleccionada?.cliente?.apellidos}</div>
          <div className="mb-3"><strong>Total: </strong> ${facturaSeleccionada?.factura?.total ?? 0}</div>

          <Form.Group className="mb-3">
            <Form.Label>Método de pago</Form.Label>
            <Form.Select value={metodoPagoSeleccionado} onChange={(e) => setMetodoPagoSeleccionado(parseInt(e.target.value))}>
              {METODOS_PAGO.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
            </Form.Select>
          </Form.Group>

          <div className="d-flex gap-2">
            <Button variant="primary" onClick={procesarPago} disabled={procesandoPago}>{procesandoPago ? <Spinner size="sm" className="me-2" animation="border" /> : null}Registrar Pago</Button>
            <Button variant="outline-secondary" onClick={() => generarPDFFacturaSeleccionada()}>Descargar PDF</Button>
          </div>
        </Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={() => setShowPagoModal(false)}>Cerrar</Button></Modal.Footer>
      </Modal>
    </div>
  );
};

export default Agendar;
