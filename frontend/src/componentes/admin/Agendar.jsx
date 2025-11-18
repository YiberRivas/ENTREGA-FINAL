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
 * MEJORAS IMPLEMENTADAS:
 * 1. ✅ Timers persistentes con localStorage (no se detienen al cambiar de pestaña)
 * 2. ✅ No recarga la página al agendar un servicio
 * 3. ✅ Cálculo preciso basado en timestamps
 * 4. ✅ Recuperación automática de timers al recargar
 */

const LOGO_URL = "/Logo-Serv.png";
const METODOS_PAGO = [
  { id: 1, nombre: "Efectivo" },
  { id: 2, nombre: "Tarjeta" },
  { id: 3, nombre: "PSE" },
  { id: 4, nombre: "Nequi/Daviplata" },
];

// ============================================================================
// UTILIDADES DE PERSISTENCIA - ESTAS SON LAS FUNCIONES CLAVE
// ============================================================================
const STORAGE_KEY = "servilavadora_timers";

/**
 * Guarda todos los timers en localStorage
 * Estructura: { id: { segundos, inicioTimestamp, estado } }
 */
const guardarTimersEnStorage = (timers) => {
  try {
    const dataToSave = {};
    Object.keys(timers).forEach(key => {
      dataToSave[key] = {
        segundos: timers[key].segundos,
        inicioTimestamp: timers[key].inicioTimestamp,
        estado: timers[key].estado
      };
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  } catch (err) {
    console.error("Error al guardar timers en localStorage:", err);
  }
};

/**
 * Carga los timers desde localStorage y recalcula el tiempo transcurrido
 * para los que están en estado "corriendo"
 */
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
    console.error("Error al cargar timers desde localStorage:", err);
    return {};
  }
};

/**
 * Elimina un timer específico del localStorage
 */
const limpiarTimerDeStorage = (id) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    
    const timers = JSON.parse(stored);
    delete timers[id];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(timers));
  } catch (err) {
    console.error("Error al limpiar timer del localStorage:", err);
  }
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
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

  // CAMBIO IMPORTANTE: Estructura mejorada de timers
  // Ahora cada timer contiene: { segundos, inicioTimestamp, estado }
  const [timers, setTimers] = useState({});
  const intervalsRef = useRef({});

  // Pago modal
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);
  const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState(METODOS_PAGO[0].id);
  const [procesandoPago, setProcesandoPago] = useState(false);
  const [qrPagoUrl, setQrPagoUrl] = useState(null);

  // Información de la cuenta para pagos
  const NUMERO_CUENTA = "+3145341174"; 
  const NOMBRE_TITULAR = "SERVILAVADORA S.A.S";

  // ============================================================================
  // EFECTO DE INICIALIZACIÓN CON PERSISTENCIA
  // ============================================================================
  useEffect(() => {
    // 1. Cargar timers guardados desde localStorage
    const timersGuardados = cargarTimersDeStorage();
    setTimers(timersGuardados);

    // 2. Reiniciar intervalos para timers que están corriendo
    Object.keys(timersGuardados).forEach(id => {
      if (timersGuardados[id].estado === "corriendo") {
        iniciarIntervalo(id);
      }
    });

    // 3. Cargar datos iniciales
    cargarDatos();

    // Cleanup: Limpiar todos los intervalos al desmontar
    return () => {
      Object.values(intervalsRef.current).forEach((intervalId) => clearInterval(intervalId));
      intervalsRef.current = {};
    };
  }, []);

  // ============================================================================
  // SINCRONIZACIÓN AUTOMÁTICA CON LOCALSTORAGE
  // ============================================================================
  useEffect(() => {
    // Cada vez que cambian los timers, guardar en localStorage
    guardarTimersEnStorage(timers);
  }, [timers]);

  // Refresh data cuando cambia el flag
  useEffect(() => {
    cargarDatos();
  }, [refreshFlag]);

  // ============================================================================
  // CARGA DE DATOS DESDE EL BACKEND
  // ============================================================================
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

  // ============================================================================
  // FUNCIONES DE TIMER MEJORADAS CON PERSISTENCIA
  // ============================================================================
  
  /**
   * Inicia el intervalo que actualiza el timer cada segundo
   * Usa timestamp para calcular el tiempo real transcurrido
   */
  const iniciarIntervalo = (id) => {
    // Limpiar intervalo existente si hay uno
    if (intervalsRef.current[id]) {
      clearInterval(intervalsRef.current[id]);
    }

    // Crear nuevo intervalo
    const intervalId = setInterval(() => {
      setTimers(prev => {
        const timer = prev[id];
        if (!timer || timer.estado !== "corriendo") {
          clearInterval(intervalId);
          delete intervalsRef.current[id];
          return prev;
        }

        // Calcular tiempo transcurrido basado en el timestamp inicial
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
      await api.post(`/agendamientos/iniciar/${id}`);

      // Guardar timestamp del momento exacto de inicio
      const ahora = Date.now();
      setTimers(prev => ({
        ...prev,
        [id]: {
          segundos: 0,
          inicioTimestamp: ahora,
          estado: "corriendo"
        }
      }));

      // Iniciar el intervalo de actualización
      iniciarIntervalo(id);

      Swal.fire({
        icon: "success",
        title: "Iniciado",
        text: "El servicio ha sido puesto en proceso.",
        timer: 1500,
        showConfirmButton: false
      });

      setRefreshFlag((f) => f + 1);
    } catch (err) {
      console.error("iniciarTemporizador:", err);
      Swal.fire("Error", err.response?.data?.detail || "No se pudo iniciar el servicio", "error");
    }
  };

  const pausarTemporizador = async (id) => {
    const confirm = await Swal.fire({
      title: "¿Pausar servicio?",
      text: "El contador se detendrá temporalmente",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, pausar",
      cancelButtonText: "Cancelar"
    });
    
    if (!confirm.isConfirmed) return;

    try {
      // Detener el intervalo
      if (intervalsRef.current[id]) {
        clearInterval(intervalsRef.current[id]);
        delete intervalsRef.current[id];
      }

      // Actualizar estado a pausado (mantiene los segundos actuales)
      setTimers(prev => ({
        ...prev,
        [id]: {
          ...prev[id],
          estado: "pausado"
        }
      }));

      // Intentar actualizar en backend
      try {
        await api.put(`/agendamientos/${id}/estado?nuevo_estado=pendiente`);
      } catch (err2) {
        console.warn("PUT estado no disponible:", err2);
      }

      Swal.fire({
        icon: "info",
        title: "Pausado",
        text: "El servicio ha sido pausado.",
        timer: 1500,
        showConfirmButton: false
      });

      setRefreshFlag((f) => f + 1);
    } catch (err) {
      console.error("pausarTemporizador:", err);
      Swal.fire("Error", "No se pudo pausar el servicio", "error");
    }
  };

  const cancelarServicio = async (id) => {
    const confirm = await Swal.fire({
      title: "¿Cancelar servicio?",
      text: "Esta acción eliminará el agendamiento",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "No",
      confirmButtonColor: "#dc3545"
    });
    
    if (!confirm.isConfirmed) return;

    try {
      // Limpiar intervalo
      if (intervalsRef.current[id]) {
        clearInterval(intervalsRef.current[id]);
        delete intervalsRef.current[id];
      }

      // Eliminar del backend
      await api.delete(`/agendamientos/${id}`);

      // Eliminar timer del estado
      setTimers((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });

      // Limpiar de localStorage
      limpiarTimerDeStorage(id);

      Swal.fire({
        icon: "success",
        title: "Cancelado",
        text: "El agendamiento fue eliminado.",
        timer: 1500,
        showConfirmButton: false
      });

      setRefreshFlag((f) => f + 1);
    } catch (err) {
      console.error("cancelarServicio:", err);
      Swal.fire("Error", "No se pudo cancelar el servicio", "error");
    }
  };

  const handleFinalizar = async (row) => {
    const tiempoData = timers[row.id_agendamiento];
    const tiempoTranscurrido = tiempoData?.segundos || 0;
    const minutos = Math.floor(tiempoTranscurrido / 60);
    const segundos = tiempoTranscurrido % 60;

    const confirm = await Swal.fire({
      title: "¿Finalizar servicio?",
      html: `<p>Tiempo transcurrido: <strong>${minutos}m ${segundos}s</strong></p><p>Esto generará automáticamente la factura del servicio.</p>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, finalizar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#28a745"
    });
    
    if (!confirm.isConfirmed) return;

    try {
      // Limpiar intervalo
      if (intervalsRef.current[row.id_agendamiento]) {
        clearInterval(intervalsRef.current[row.id_agendamiento]);
        delete intervalsRef.current[row.id_agendamiento];
      }

      const payload = {
        agendamiento_id: row.id_agendamiento,
        observaciones: `Tiempo: ${minutos}m ${segundos}s`,
        calificacion: null
      };

      const res = await api.post("/agendamientos/finalizar", payload);
      const data = res.data || {};
      const factura = data.factura ?? {};
      const cliente = data.cliente ?? row.persona ?? {};
      const servicio = data.servicio ?? row.servicio ?? {};

      // Eliminar timer del estado
      setTimers((prev) => {
        const copy = { ...prev };
        delete copy[row.id_agendamiento];
        return copy;
      });

      // Limpiar de localStorage
      limpiarTimerDeStorage(row.id_agendamiento);

      // Abrir modal de pago con la factura recién creada
      setFacturaSeleccionada({ factura, cliente, servicio });
      setMetodoPagoSeleccionado(METODOS_PAGO[0].id);
      setQrPagoUrl(null); // Limpiar QR anterior
      setShowPagoModal(true);

      setRefreshFlag((f) => f + 1);
    } catch (err) {
      console.error("handleFinalizar:", err);
      Swal.fire("Error", err.response?.data?.detail || "No se pudo finalizar", "error");
    }
  };

  // ============================================================================
  // BÚSQUEDA DE CLIENTE
  // ============================================================================
  const buscarClientePorCedula = async () => {
    if (!cedula.trim()) {
      Swal.fire("Cédula requerida", "Por favor ingresa la cédula", "warning");
      return;
    }

    setBuscandoCliente(true);
    try {
      const persona = personas.find(
        (p) => String(p.identificacion) === cedula.trim() || 
               String(p.identificacion) === cedula.replace(/\D/g, "")
      );

      if (persona) {
        setClienteEncontrado(persona);
        setFormData((f) => ({
          ...f,
          persona_id: persona.id_persona,
          direccion: persona.direccion?.direccion_detalle || ""
        }));

        Swal.fire({
          icon: "success",
          title: "Cliente encontrado",
          html: `<strong>${persona.nombres} ${persona.apellidos}</strong><br/>${persona.correo || ""}`,
          timer: 1400,
          showConfirmButton: false
        });
      } else {
        setClienteEncontrado(null);
        setFormData((f) => ({ ...f, persona_id: "", direccion: "" }));

        const res = await Swal.fire({
          title: "Cliente no encontrado",
          text: "No existe un cliente registrado con esta cédula",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Registrar Cliente",
          cancelButtonText: "Cancelar"
        });

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
      setFormData((f) => ({
        ...f,
        persona_id: nuevaPersona.id_persona,
        direccion: nuevaPersona.direccion?.direccion_detalle || ""
      }));
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
      observaciones: ""
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ============================================================================
  // SUBMIT MEJORADO - NO RECARGA LA PÁGINA
  // ============================================================================
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

      Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: "Agendamiento creado correctamente",
        timer: 1500,
        showConfirmButton: false
      });

      // CAMBIO: Ya no limpiamos el formulario automáticamente
      // El usuario puede seguir agendando más servicios para el mismo cliente
      // Si quieres limpiar, descomenta la siguiente línea:
      // limpiarBusqueda();

      // Solo limpiamos los campos específicos del servicio
      setFormData(prev => ({
        ...prev,
        servicio_id: "",
        fecha: "",
        hora: "",
        observaciones: ""
      }));

      setRefreshFlag((f) => f + 1);
    } catch (err) {
      console.error("handleSubmit:", err);
      Swal.fire("Error", err.response?.data?.detail || "No se pudo crear el agendamiento", "error");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // PAGO Y FACTURACIÓN
  // ============================================================================
const procesarPago = async () => {
  if (!facturaSeleccionada?.factura?.id_factura) {
    Swal.fire("Error", "Factura no encontrada para procesar pago", "error");
    return;
  }

  setProcesandoPago(true);
  const idFactura = facturaSeleccionada.factura.id_factura;
  const id_forma_pago = metodoPagoSeleccionado;
  const monto = facturaSeleccionada.factura.total;

  try {
    // Preparar datos del pago en el formato que espera el backend
    const datosPago = {
      id_factura: parseInt(idFactura),
      id_forma_pago: parseInt(id_forma_pago),
      monto: parseFloat(monto)
    };

    console.log("🟡 Enviando pago al backend:", datosPago);

    // 1) Registrar el pago en la base de datos
    const response = await api.post("/pagos/", datosPago, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (response.status === 200 || response.status === 201) {
      console.log("🟢 Pago registrado exitosamente:", response.data);
      
      // 2) Opcional: Actualizar el estado de la factura a "pagada"
      try {
        await api.put(`/facturas/${idFactura}/estado?nuevo_estado=pagada`);
        console.log("🟢 Estado de factura actualizado a 'pagada'");
      } catch (errFactura) {
        console.warn("🟡 No se pudo actualizar el estado de la factura:", errFactura);
        // No es crítico si falla, continuamos
      }

      Swal.fire({
        icon: "success",
        title: "¡Pago exitoso!",
        html: `
          <div class="text-start">
            <p>El pago se ha registrado correctamente en la base de datos</p>
            <div class="mt-2 p-2 bg-light rounded">
              <small><strong>Detalles:</strong></small><br/>
              <small>Factura: #${idFactura}</small><br/>
              <small>Monto: $${monto}</small><br/>
              <small>Método: ${METODOS_PAGO.find(m => m.id === id_forma_pago)?.nombre}</small>
            </div>
          </div>
        `,
        timer: 3000,
        showConfirmButton: false
      });

      // Cerrar modal y actualizar interfaz
      setShowPagoModal(false);
      setFacturaSeleccionada(null);
      setQrPagoUrl(null);
      setRefreshFlag(f => f + 1);
    }

  } catch (error) {
    console.error("🔴 Error completo al procesar pago:", {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status,
      config: error.config
    });
    
    let mensajeError = "No se pudo registrar el pago";
    let detalleTecnico = error.message;

    if (error.code === 'ERR_NETWORK' || error.message.includes('CORS')) {
      mensajeError = "Error de conexión con el servidor";
      detalleTecnico = "Problema de CORS o el servidor no está respondiendo. Verifica que el backend esté ejecutándose y tenga CORS configurado.";
    } else if (error.response?.status === 500) {
      mensajeError = "Error interno del servidor";
      detalleTecnico = error.response.data?.detail || "El servidor encontró un error al procesar la solicitud. Revisa los logs del backend.";
    } else if (error.response?.status === 404) {
      mensajeError = "Endpoint no encontrado";
      detalleTecnico = "La ruta /pagos/ no existe en el backend";
    } else if (error.response?.status === 400) {
      mensajeError = "Datos de pago inválidos";
      detalleTecnico = error.response.data?.detail || JSON.stringify(error.response.data);
    }

    Swal.fire({
      icon: "error",
      title: "Error al procesar pago",
      html: `
        <div class="text-start">
          <p class="fw-bold">${mensajeError}</p>
          <div class="mt-2 p-2 bg-light rounded">
            <small class="text-muted">Detalle técnico:</small><br/>
            <code class="small">${detalleTecnico}</code>
          </div>
          ${error.code === 'ERR_NETWORK' ? `
            <div class="mt-2">
              <small class="text-warning">
                <i class="fas fa-exclamation-triangle me-1"></i>
                Posible solución: Configura CORS en tu backend FastAPI
              </small>
            </div>
          ` : ''}
        </div>
      `,
      confirmButtonText: "Entendido",
      width: 600
    });
  } finally {
    setProcesandoPago(false);
  }
};
  // Generar QR cuando se selecciona Nequi/Daviplata
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

  const generarPDFFacturaSeleccionada = async () => {
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
    doc.text(`Correo: ${cliente.correo ?? ""}`, 15, 70);

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

  // ============================================================================
  // UTILIDADES DE FORMATO
  // ============================================================================
  const formatearTiempo = (id) => {
    const timer = timers[id];
    if (!timer) return "00:00";
    
    const mins = Math.floor(timer.segundos / 60);
    const secs = timer.segundos % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getEstadoTimer = (id) => {
    const timer = timers[id];
    return timer?.estado || null;
  };

  const pendientes = agendamientos.filter((a) =>
    ["pendiente", "confirmado", "en_proceso"].includes(String(a.estado))
  );

  // ============================================================================
  // RENDER
  // ============================================================================
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
              <Button
                variant="success"
                size="sm"
                onClick={() => setShowRegistroModal(true)}
                className="me-2"
              >
                <i className="fas fa-user-plus me-1"></i> Registrar Cliente
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setRefreshFlag(f => f + 1)}
              >
                <i className="fas fa-sync-alt me-1"></i> Refrescar
              </Button>
            </div>
          </div>

          <Row>
            <Col lg={10} className="mx-auto">
              <Card className="shadow-sm border-0 mb-4">
                <Card.Body>
                  <Form onSubmit={handleSubmit}>
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
                            <>
                              <i className="fas fa-search me-1"></i>Buscar
                            </>
                          )}
                        </Button>
                        {clienteEncontrado && (
                          <Button variant="outline-secondary" onClick={limpiarBusqueda}>
                            <i className="fas fa-times"></i>
                          </Button>
                        )}
                      </InputGroup>
                    </Form.Group>

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

                    <Form.Group className="mb-3">
                      <Form.Label>
                        <i className="fas fa-cogs me-2 text-success"></i>Servicio *
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
                          <option key={s.id_servicio ?? s.id} value={s.id_servicio ?? s.id}>
                            {s.nombre_servicio} - ${s.precio_base} ({s.duracion_minutos} min)
                          </option>
                        ))}
                      </Form.Select>
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
                            disabled={!clienteEncontrado}
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
                            disabled={!clienteEncontrado}
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label>
                        <i className="fas fa-map-marker-alt me-2 text-danger"></i>Dirección
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
                        placeholder="Notas adicionales..."
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
                          <>
                            <Spinner size="sm" className="me-2" />
                            Agendando...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-check me-2"></i>Agendar Servicio
                          </>
                        )}
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>

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
                          <th style={{ width: "60px" }}>#</th>
                          <th>Cliente</th>
                          <th>Servicio</th>
                          <th>Fecha / Hora</th>
                          <th style={{ width: "120px" }}>Estado</th>
                          <th style={{ width: "180px" }}>Acciones</th>
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
                        ) : (
                          pendientes.map((row, index) => {
                            const estadoTimer = getEstadoTimer(row.id_agendamiento);
                            const tieneTimer = estadoTimer === "corriendo" || estadoTimer === "pausado";
                            
                            return (
                              <tr key={row.id_agendamiento}>
                                <td className="fw-bold">{index + 1}</td>
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
                                      estadoTimer === "corriendo"
                                        ? "info"
                                        : estadoTimer === "pausado"
                                        ? "warning"
                                        : row.estado === "pendiente"
                                        ? "secondary"
                                        : row.estado === "finalizado"
                                        ? "success"
                                        : "warning"
                                    }
                                    style={{ fontSize: "0.85rem", padding: "0.4rem 0.6rem" }}
                                  >
                                    {tieneTimer ? (
                                      <>
                                        <i className={`fas fa-${estadoTimer === "corriendo" ? "clock" : "pause"} me-1`}></i>
                                        {formatearTiempo(row.id_agendamiento)}
                                      </>
                                    ) : (
                                      row.estado
                                    )}
                                  </Badge>
                                </td>
                                <td>
                                  <div className="d-flex justify-content-center gap-1">
                                    <Button
                                      size="sm"
                                      variant="success"
                                      onClick={() => iniciarTemporizador(row.id_agendamiento)}
                                      disabled={estadoTimer === "corriendo"}
                                      style={{ width: "36px", height: "36px", padding: 0 }}
                                      title="Iniciar"
                                    >
                                      <i className="fas fa-play"></i>
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="warning"
                                      onClick={() => pausarTemporizador(row.id_agendamiento)}
                                      disabled={estadoTimer !== "corriendo"}
                                      style={{ width: "36px", height: "36px", padding: 0 }}
                                      title="Pausar"
                                    >
                                      <i className="fas fa-pause"></i>
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="danger"
                                      onClick={() => cancelarServicio(row.id_agendamiento)}
                                      style={{ width: "36px", height: "36px", padding: 0 }}
                                      title="Cancelar"
                                    >
                                      <i className="fas fa-times"></i>
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="primary"
                                      onClick={() => handleFinalizar(row)}
                                      disabled={estadoTimer !== "corriendo"}
                                      style={{ width: "36px", height: "36px", padding: 0 }}
                                      title="Finalizar"
                                    >
                                      <i className="fas fa-check"></i>
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      <RegistroCliente
        show={showRegistroModal}
        onHide={() => setShowRegistroModal(false)}
        onCreated={handleClienteCreado}
      />

      <Modal show={showPagoModal} onHide={() => setShowPagoModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            Registrar Pago - Factura #{facturaSeleccionada?.factura?.id_factura ?? "N/A"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <strong>Cliente: </strong>
            {facturaSeleccionada?.cliente?.nombres} {facturaSeleccionada?.cliente?.apellidos}
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

          {/* Mostrar información de cuenta para PSE, Tarjeta y Nequi/Daviplata */}
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
              Pago en <strong>efectivo</strong>. Confirma al recibir el pago.
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
              onClick={() => generarPDFFacturaSeleccionada()}
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

export default Agendar;
                