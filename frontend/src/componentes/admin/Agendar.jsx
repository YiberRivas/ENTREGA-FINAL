import React, { useEffect, useState } from "react";
import {
  Container, Row, Col, Card, Form, Button, Spinner, Alert, InputGroup, Table, Badge
} from "react-bootstrap";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Swal from "sweetalert2";
import api from "../../api/axiosConfig";
import AdminSidebar from "./AdminSidebar";
import Logo from "../../assets/img/Logo-Serv.png";
import RegistroCliente from "./RegistroCliente";

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
  
  // Estado del temporizador
  const [timers, setTimers] = useState({});
  const [intervals, setIntervals] = useState({});

  useEffect(() => {
    cargarDatos();
  }, [refreshFlag]);

  // Limpiar intervalos al desmontar
  useEffect(() => {
    return () => {
      Object.values(intervals).forEach(interval => clearInterval(interval));
    };
  }, [intervals]);

  const cargarDatos = async () => {
    try {
      setLoadingData(true);
      const [resPersonas, resServicios, resAgendamientos] = await Promise.all([
        api.get("/personas/"),
        api.get("/servicios/"),
        api.get("/agendamientos/"),
      ]);

      console.log("Personas cargadas:", resPersonas.data);
      console.log("Servicios cargados:", resServicios.data);
      console.log("Agendamientos cargados:", resAgendamientos.data);

      setPersonas(resPersonas.data);
      setServicios(resServicios.data);
      
      // Formatear agendamientos
      const agendamientosFormateados = (resAgendamientos.data || []).map(ag => ({
        id_agendamiento: ag.id_agendamiento || ag.id,
        persona_id: ag.persona_id,
        servicio_id: ag.servicio_id,
        fecha: ag.fecha,
        hora: ag.hora,
        estado: ag.estado,
        observaciones: ag.observaciones,
        persona: ag.persona || {},
        servicio: ag.servicio || {}
      }));
      
      setAgendamientos(agendamientosFormateados);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      Swal.fire("Error", "No se pudieron cargar los datos necesarios", "error");
    } finally {
      setLoadingData(false);
    }
  };

  // 🔍 Buscar cliente por cédula
  const buscarClientePorCedula = async () => {
    if (!cedula.trim()) {
      Swal.fire("Cédula requerida", "Por favor ingresa la cédula", "warning");
      return;
    }

    setBuscandoCliente(true);
    try {
      console.log("Buscando cédula:", cedula);
      console.log("Personas disponibles:", personas);
      
      // Buscar en la tabla persona por el campo identificacion
      const persona = personas.find((p) => {
        console.log("Comparando:", p.identificacion, "con", cedula.trim());
        return p.identificacion === cedula.trim();
      });

      if (persona) {
        console.log("Persona encontrada:", persona);
        setClienteEncontrado(persona);
        setFormData({
          ...formData,
          persona_id: persona.id_persona,
          direccion: persona.direccion?.direccion_detalle || "",
        });
        Swal.fire({
          icon: "success",
          title: "Cliente encontrado",
          html: `<strong>${persona.nombres} ${persona.apellidos}</strong><br/>${persona.correo}`,
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        console.log("Persona NO encontrada");
        setClienteEncontrado(null);
        setFormData({ ...formData, persona_id: "", direccion: "" });
        
        const res = await Swal.fire({
          title: "Cliente no encontrado",
          text: "No existe un cliente registrado con esta cédula",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Registrar Cliente",
          cancelButtonText: "Cancelar"
        });
        
        if (res.isConfirmed) {
          setShowRegistroModal(true);
        }
      }
    } catch (error) {
      console.error("Error al buscar cliente:", error);
      Swal.fire("Error", "No se pudo buscar el cliente", "error");
    } finally {
      setBuscandoCliente(false);
    }
  };

  const handleClienteCreado = (nuevaPersona) => {
    setShowRegistroModal(false);
    if (nuevaPersona?.id_persona) {
      setClienteEncontrado(nuevaPersona);
      setFormData({
        ...formData,
        persona_id: nuevaPersona.id_persona,
        direccion: nuevaPersona.direccion?.direccion_detalle || "",
      });
      Swal.fire("Cliente registrado", "Se agregó correctamente", "success");
      setRefreshFlag((f) => f + 1);
    }
  };

  const limpiarBusqueda = () => {
    setCedula("");
    setClienteEncontrado(null);
    setFormData({
      persona_id: "",
      servicio_id: "",
      direccion: "",
      fecha: "",
      hora: "",
      observaciones: "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ✅ Crear agendamiento
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
      
      console.log("Enviando agendamiento:", payload);
      
      const response = await api.post("/agendamientos/", payload);
      
      console.log("Respuesta del servidor:", response.data);

      Swal.fire("Éxito", "Agendamiento creado correctamente", "success");
      limpiarBusqueda();
      setRefreshFlag(f => f + 1);
    } catch (err) {
      console.error("Error al crear agendamiento:", err);
      console.error("Detalle del error:", err.response?.data);
      Swal.fire("Error", err.response?.data?.detail || "No se pudo crear el agendamiento", "error");
    } finally {
      setLoading(false);
    }
  };

  // ⏱️ Funciones del temporizador
  const iniciarTemporizador = async (id) => {
    const confirm = await Swal.fire({
      title: "¿Iniciar servicio?",
      text: "Se iniciará el contador de tiempo",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, iniciar",
      cancelButtonText: "Cancelar"
    });

    if (!confirm.isConfirmed) return;

    try {
      await cambiarEstado(id, "en_proceso");
      
      setTimers(prev => ({ ...prev, [id]: 0 }));
      
      const interval = setInterval(() => {
        setTimers(prev => ({
          ...prev,
          [id]: (prev[id] || 0) + 1
        }));
      }, 1000);
      
      setIntervals(prev => ({ ...prev, [id]: interval }));
    } catch (error) {
      console.error("Error al iniciar:", error);
    }
  };

  const pausarTemporizador = async (id) => {
    const confirm = await Swal.fire({
      title: "¿Pausar servicio?",
      text: "El contador se detendrá",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, pausar",
      cancelButtonText: "Cancelar"
    });

    if (!confirm.isConfirmed) return;

    try {
      if (intervals[id]) {
        clearInterval(intervals[id]);
        setIntervals(prev => {
          const newIntervals = { ...prev };
          delete newIntervals[id];
          return newIntervals;
        });
      }
      await cambiarEstado(id, "pendiente");
    } catch (error) {
      console.error("Error al pausar:", error);
    }
  };

  const cancelarServicio = async (id) => {
    const confirm = await Swal.fire({
      title: "¿Cancelar servicio?",
      text: "Esta acción marcará el servicio como cancelado",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "No",
      confirmButtonColor: "#dc3545"
    });

    if (!confirm.isConfirmed) return;

    try {
      if (intervals[id]) {
        clearInterval(intervals[id]);
        setIntervals(prev => {
          const newIntervals = { ...prev };
          delete newIntervals[id];
          return newIntervals;
        });
      }
      
      await cambiarEstado(id, "cancelado");
      
      setTimers(prev => {
        const newTimers = { ...prev };
        delete newTimers[id];
        return newTimers;
      });
    } catch (error) {
      console.error("Error al cancelar:", error);
    }
  };

  const cambiarEstado = async (id, estado) => {
    try {
      await api.put(`/agendamientos/${id}/estado?nuevo_estado=${estado}`);
      setRefreshFlag(f => f + 1);
      Swal.fire("Actualizado", `Estado cambiado a ${estado}`, "success");
    } catch (err) {
      console.error("Error al cambiar estado:", err);
      Swal.fire("Error", err.response?.data?.detail || "No se pudo actualizar estado", "error");
    }
  };



  // 🧾 Finalizar servicio y generar factura PDF
 // Ajusta la ruta si está en otro lugar

const handleFinalizar = async (row) => {
  const tiempoTranscurrido = timers[row.id_agendamiento] || 0;
  const minutos = Math.floor(tiempoTranscurrido / 60);
  const segundos = tiempoTranscurrido % 60;

  const confirm = await Swal.fire({
    title: "¿Finalizar servicio?",
    html: `
      <p>Tiempo transcurrido: <strong>${minutos}m ${segundos}s</strong></p>
      <p>Esto generará automáticamente la factura del servicio.</p>
    `,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Sí, finalizar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#28a745"
  });

  if (!confirm.isConfirmed) return;

  try {
    if (intervals[row.id_agendamiento]) {
      clearInterval(intervals[row.id_agendamiento]);
    }

    const { data } = await api.post("/agendamientos/finalizar", {
      agendamiento_id: row.id_agendamiento,
      observaciones: `Tiempo: ${minutos}m ${segundos}s`,
      calificacion: null,
    });

    const factura = data.factura;
    const cliente = data.cliente;
    const servicio = data.servicio;

    // ✅ Función auxiliar: convertir imagen a base64
    const getBase64Image = (imgUrl) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = imgUrl;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = "white"; // Fondo blanco para evitar transparencia
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          const dataURL = canvas.toDataURL("image/png");
          resolve(dataURL);
        };
        img.onerror = reject;
      });
    };

    // ✅ Generar PDF profesional
    const generarPDF = async () => {
      const doc = new jsPDF();
      const logoBase64 = await getBase64Image(Logo);

      // Generar QR con enlace a factura (puedes cambiar el dominio)
      const qrData = await QRCode.toDataURL(`https://servilavadora.com/facturas/${factura.id_factura}`);

      // === ENCABEZADO ===
      doc.addImage(logoBase64, "PNG", 15, 10, 30, 30);
      doc.setFontSize(18);
      doc.setTextColor(40, 40, 40);
      doc.text("SERVILAVADORA S.A.S", 50, 20);
      doc.setFontSize(11);
      doc.text("Limpieza Profesional de Lavadoras a Domicilio", 50, 26);
      doc.text("Tel: +57 321 000 0000 | servilavadora@gmail.com", 50, 32);
      doc.text("Calle 45 #10-25, Quibdó - Chocó", 50, 38);

      // Línea separadora
      doc.setDrawColor(0);
      doc.setLineWidth(0.5);
      doc.line(15, 45, 195, 45);

      // === DATOS FACTURA ===
      doc.setFontSize(13);
      doc.setTextColor(0, 102, 204);
      doc.text("FACTURA DE SERVICIO", 15, 55);

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(`Factura N°: ${factura.id_factura}`, 15, 63);
      doc.text(`Fecha: ${new Date(factura.fecha).toLocaleString()}`, 15, 69);
      doc.text(`Estado: ${factura.estado}`, 15, 75);

      // === DATOS CLIENTE ===
      doc.setFontSize(13);
      doc.setTextColor(0, 102, 204);
      doc.text("Datos del Cliente", 15, 87);

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(`Nombre: ${cliente.nombres} ${cliente.apellidos}`, 15, 94);
      doc.text(`Identificación: ${cliente.identificacion}`, 15, 100);
      doc.text(`Correo: ${cliente.correo}`, 15, 106);
      doc.text(`Teléfono: ${cliente.telefono}`, 15, 112);

      // === DETALLES SERVICIO ===
      doc.setFontSize(13);
      doc.setTextColor(0, 102, 204);
      doc.text("Detalles del Servicio", 15, 125);

      doc.autoTable({
        startY: 130,
        head: [["Servicio", "Precio Base", "Forma de Pago"]],
        body: [
          [
            servicio.nombre_servicio,
            `$${servicio.precio_base}`,
            factura.forma_pago_id === 1 ? "Efectivo" : factura.forma_pago_id
          ]
        ],
        theme: "grid",
        headStyles: { fillColor: [40, 167, 69] },
      });

      // === TOTAL ===
      const finalY = doc.lastAutoTable.finalY || 140;
      doc.setFontSize(13);
      doc.setTextColor(0, 0, 0);
      doc.text(`Total a Pagar:`, 15, finalY + 15);
      doc.setFontSize(16);
      doc.setTextColor(20, 150, 20);
      doc.text(`$${factura.total}`, 50, finalY + 15);

      // === CÓDIGO QR ===
      doc.addImage(qrData, "PNG", 160, 250, 30, 30);
      doc.setFontSize(9);
      doc.text("Escanea para ver factura en línea", 130, 285);

      // === PIE DE PÁGINA ===
      doc.setDrawColor(200);
      doc.line(15, 270, 195, 270);
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("SERVILAVADORA S.A.S - Gracias por su confianza.", 15, 277);
      doc.text("Factura generada automáticamente desde el sistema.", 15, 283);

      // Firma
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text("_________________________", 140, 270);
      doc.text("Firma Autorizada", 150, 278);

      doc.save(`Factura_${factura.id_factura}.pdf`);
    };

    // Mostrar alerta con botón para generar PDF
    Swal.fire({
      icon: "success",
      title: "Factura generada",
      html: `
        <div class="text-start">
          <h5 class="text-success mb-2"><i class="fas fa-receipt"></i> Detalles de Factura</h5>
          <hr/>
          <p><strong>ID Factura:</strong> #${factura.id_factura}</p>
          <p><strong>Cliente:</strong> ${cliente.nombres} ${cliente.apellidos}</p>
          <p><strong>Servicio:</strong> ${servicio.nombre_servicio}</p>
          <p><strong>Total:</strong> $${factura.total}</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Descargar PDF",
      cancelButtonText: "Cerrar",
      confirmButtonColor: "#28a745",
      width: 500,
    }).then((result) => {
      if (result.isConfirmed) generarPDF();
    });

    setRefreshFlag(f => f + 1);
    setTimers(prev => {
      const newTimers = { ...prev };
      delete newTimers[row.id_agendamiento];
      return newTimers;
    });

  } catch (err) {
    console.error("Error al finalizar:", err);
    Swal.fire("Error", err.response?.data?.detail || "No se pudo finalizar", "error");
  }
};

  const formatearTiempo = (segundos) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const pendientes = agendamientos.filter(a =>
    ["pendiente", "confirmado", "en_proceso"].includes(a.estado)
  );

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
            <h4 className="text-info fw-bold mb-0">
              <i className="fas fa-calendar-plus me-2"></i> Agendar Servicio
            </h4>
            <div>
              <Button variant="success" size="sm" onClick={() => setShowRegistroModal(true)} className="me-2">
                <i className="fas fa-user-plus me-1"></i> Registrar Cliente
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setRefreshFlag(f => f + 1)}>
                <i className="fas fa-sync-alt me-1"></i> Refrescar
              </Button>
            </div>
          </div>

          <Row>
            <Col lg={10} className="mx-auto">
              <Card className="shadow-sm border-0 mb-4">
                <Card.Body>
                  <Form onSubmit={handleSubmit}>
                    {/* Cédula */}
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <i className="fas fa-id-card me-2 text-primary"></i>
                        Cédula del Cliente *
                      </Form.Label>
                      <InputGroup>
                        <Form.Control
                          type="text"
                          placeholder="Número de cédula"
                          value={cedula}
                          onChange={(e) => setCedula(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              buscarClientePorCedula();
                            }
                          }}
                        />
                        <Button 
                          variant="info" 
                          onClick={buscarClientePorCedula} 
                          disabled={buscandoCliente}
                        >
                          {buscandoCliente ? (
                            <Spinner animation="border" size="sm" />
                          ) : (
                            <><i className="fas fa-search me-1"></i>Buscar</>
                          )}
                        </Button>
                        {clienteEncontrado && (
                          <Button variant="outline-secondary" onClick={limpiarBusqueda}>
                            <i className="fas fa-times"></i>
                          </Button>
                        )}
                      </InputGroup>
                    </Form.Group>

                    {/* Cliente Encontrado */}
                    {clienteEncontrado && (
                      <Alert variant="success" className="d-flex align-items-center">
                        <i className="fas fa-check-circle fs-4 me-3"></i>
                        <div>
                          <strong>{clienteEncontrado.nombres} {clienteEncontrado.apellidos}</strong>
                          <br />
                          <small>{clienteEncontrado.correo} | {clienteEncontrado.telefono}</small>
                        </div>
                      </Alert>
                    )}

                    {/* Servicio */}
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <i className="fas fa-cogs me-2 text-success"></i>
                        Servicio *
                      </Form.Label>
                      <Form.Select 
                        name="servicio_id" 
                        value={formData.servicio_id} 
                        onChange={handleChange}
                        disabled={!clienteEncontrado}
                        required
                      >
                        <option value="">-- Selecciona un servicio --</option>
                        {servicios.map(s => (
                          <option key={s.id_servicio} value={s.id_servicio}>
                            {s.nombre_servicio} - ${s.precio_base} ({s.duracion_minutos} min)
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>

                    {/* Fecha y Hora */}
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            <i className="fas fa-calendar me-2 text-warning"></i>
                            Fecha *
                          </Form.Label>
                          <Form.Control 
                            type="date" 
                            name="fecha" 
                            value={formData.fecha} 
                            onChange={handleChange}
                            min={new Date().toISOString().split('T')[0]}
                            disabled={!clienteEncontrado}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            <i className="fas fa-clock me-2 text-info"></i>
                            Hora *
                          </Form.Label>
                          <Form.Control 
                            type="time" 
                            name="hora" 
                            value={formData.hora} 
                            onChange={handleChange}
                            disabled={!clienteEncontrado}
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    {/* Dirección */}
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <i className="fas fa-map-marker-alt me-2 text-danger"></i>
                        Dirección
                      </Form.Label>
                      <Form.Control 
                        type="text" 
                        name="direccion" 
                        value={formData.direccion} 
                        onChange={handleChange}
                        disabled={!clienteEncontrado}
                        placeholder="Dirección del servicio"
                      />
                    </Form.Group>

                    {/* Observaciones */}
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
                        disabled={!clienteEncontrado}
                        placeholder="Notas adicionales sobre el servicio..."
                      />
                    </Form.Group>

                    <div className="text-end">
                      <Button 
                        type="submit" 
                        variant="info" 
                        className="text-white"
                        disabled={loading || !clienteEncontrado}
                      >
                        {loading ? (
                          <><Spinner size="sm" className="me-2" />Agendando...</>
                        ) : (
                          <><i className="fas fa-check me-2"></i>Agendar Servicio</>
                        )}
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>

              {/* TABLA DE AGENDAMIENTOS */}
              <Card className="shadow-sm">
                <Card.Body>
                  <Card.Title className="fw-bold mb-3">
                    <i className="fas fa-list me-2 text-info"></i>
                    Agendamientos Activos ({pendientes.length})
                  </Card.Title>
                  <div className="table-responsive">
                    <Table bordered hover className="align-middle text-center mb-0">
                      <thead className="table-light">
                        <tr>
                          <th style={{width: "60px"}}>ID</th>
                          <th>Cliente</th>
                          <th>Servicio</th>
                          <th>Fecha / Hora</th>
                          <th style={{width: "120px"}}>Estado</th>
                          <th style={{width: "180px"}}>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendientes.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="text-muted py-4">
                              <i className="fas fa-inbox fa-2x mb-2 d-block"></i>
                              No hay agendamientos activos
                            </td>
                          </tr>
                        ) : pendientes.map((row) => (
                          <tr key={row.id_agendamiento}>
                            <td className="fw-bold">#{row.id_agendamiento}</td>
                            <td className="text-start">
                              <i className="fas fa-user-circle me-2 text-muted"></i>
                              {row.persona?.nombres} {row.persona?.apellidos}
                            </td>
                            <td>{row.servicio?.nombre_servicio}</td>
                            <td>
                              <div>
                                <i className="fas fa-calendar me-1 text-muted"></i>
                                {row.fecha}
                              </div>
                              <small className="text-muted">
                                <i className="fas fa-clock me-1"></i>
                                {row.hora}
                              </small>
                            </td>
                            <td>
                              <Badge 
                                bg={
                                  row.estado === "pendiente" ? "secondary" :
                                  row.estado === "en_proceso" ? "info" :
                                  row.estado === "finalizado" ? "success" :
                                  "warning"
                                }
                                style={{ fontSize: "0.85rem", padding: "0.4rem 0.6rem" }}
                              >
                                {row.estado === "en_proceso" && timers[row.id_agendamiento] ? (
                                  <>
                                    <i className="fas fa-clock me-1"></i>
                                    {formatearTiempo(timers[row.id_agendamiento])}
                                  </>
                                ) : (
                                  row.estado
                                )}
                              </Badge>
                            </td>
                            <td>
                              <div className="d-flex justify-content-center gap-1">
                                {/* Play */}
                                <Button 
                                  size="sm" 
                                  variant="success" 
                                  onClick={() => iniciarTemporizador(row.id_agendamiento)}
                                  disabled={row.estado === "en_proceso"}
                                  style={{ width: "36px", height: "36px", padding: "0" }}
                                  title="Iniciar"
                                >
                                  <i className="fas fa-play"></i>
                                </Button>

                                {/* Pause */}
                                <Button 
                                  size="sm" 
                                  variant="warning" 
                                  onClick={() => pausarTemporizador(row.id_agendamiento)}
                                  disabled={row.estado !== "en_proceso"}
                                  style={{ width: "36px", height: "36px", padding: "0" }}
                                  title="Pausar"
                                >
                                  <i className="fas fa-pause"></i>
                                </Button>

                                {/* Cancel */}
                                <Button 
                                  size="sm" 
                                  variant="danger" 
                                  onClick={() => cancelarServicio(row.id_agendamiento)}
                                  style={{ width: "36px", height: "36px", padding: "0" }}
                                  title="Cancelar"
                                >
                                  <i className="fas fa-times"></i>
                                </Button>

                                {/* Finish */}
                                <Button 
                                  size="sm" 
                                  variant="primary" 
                                  onClick={() => handleFinalizar(row)}
                                  disabled={row.estado !== "en_proceso"}
                                  style={{ width: "36px", height: "36px", padding: "0" }}
                                  title="Finalizar"
                                >
                                  <i className="fas fa-check"></i>
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

      {/* MODAL DE REGISTRO */}
      <RegistroCliente
        show={showRegistroModal}
        onHide={() => setShowRegistroModal(false)}
        onCreated={handleClienteCreado}
      />
    </div>
  );
};

export default Agendar;