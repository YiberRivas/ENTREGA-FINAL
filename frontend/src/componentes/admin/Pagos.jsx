// src/pages/admin/Pagos.jsx - VERSIÓN CON PAGINACIÓN + BACKEND
import React, { useEffect, useState } from "react";
import {
  Container,
  Card,
  Table,
  Form,
  InputGroup,
  Badge,
  Button,
  Modal,
  Row,
  Col,
  Spinner
} from "react-bootstrap";
import Swal from "sweetalert2";
import api from "../../api/axiosConfig";

const Pagos = () => {

  const [pagos, setPagos] = useState([]);
  const [filtro, setFiltro] = useState("");

  // NUEVO: paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);

  const [nuevoPago, setNuevoPago] = useState({
    id_factura: "",
    id_forma_pago: 1,
    monto: ""
  });

  const [formasPago] = useState([
    { id_forma_pago: 1, nombre: "Efectivo" },
    { id_forma_pago: 2, nombre: "Tarjeta" },
    { id_forma_pago: 26, nombre: "PSE" },
    { id_forma_pago: 27, nombre: "Nequi/Daviplata" }
  ]);

  const [loading, setLoading] = useState(false);
  const [modalPago, setModalPago] = useState(false);
  const [detallePago, setDetallePago] = useState(null);

  useEffect(() => {
    obtenerPagos();
  }, []);

  // -----------------------------
  // Cargar Pagos
  // -----------------------------
  const obtenerPagos = async () => {
    setLoading(true);
    try {
      const res = await api.get("/pagos/");
      setPagos(res.data || []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error al cargar pagos",
        text: error.response?.data?.detail || "No se pudieron obtener los pagos del sistema"
      });
      setPagos([]);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Crear Pago
  // -----------------------------
  const crearPago = async () => {
    if (!nuevoPago.id_factura || !nuevoPago.monto) {
      return Swal.fire("Campos incompletos", "Debes ingresar el ID de factura y el monto", "warning");
    }

    try {
      const payload = {
        id_factura: parseInt(nuevoPago.id_factura),
        id_forma_pago: parseInt(nuevoPago.id_forma_pago),
        monto: parseFloat(nuevoPago.monto)
      };

      const response = await api.post("/pagos/", payload);

      Swal.fire({
        icon: "success",
        title: "Pago registrado",
        text: `Pago #${response.data.id_pago} creado correctamente`
      });

      setNuevoPago({ id_factura: "", id_forma_pago: 1, monto: "" });
      obtenerPagos();

    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.detail || "No se pudo registrar el pago",
        "error"
      );
    }
  };

  // -----------------------------
  // Ver detalle de pago
  // -----------------------------
  const verPago = async (id_pago) => {
    try {
      const res = await api.get(`/pagos/${id_pago}`);
      setDetallePago(res.data);
      setModalPago(true);
    } catch (error) {
      Swal.fire("Error", "No se pudo cargar el detalle del pago", "error");
    }
  };

  // -----------------------------
  // Ver pagos de factura
  // -----------------------------
  const verPagosFactura = async (idFactura) => {
    try {
      const res = await api.get(`/pagos/factura/${idFactura}`);
      const pagosFactura = res.data || [];

      if (pagosFactura.length === 0) {
        return Swal.fire("Pagos", "La factura no tiene pagos registrados", "info");
      }

      const lista = pagosFactura
        .map(
          (p) => `
        <div style="padding:10px; border:1px solid #ddd; margin-bottom:8px; border-radius:6px;">
          <strong>Pago #${p.id_pago}</strong><br/>
          💰 Monto: $${parseFloat(p.monto).toLocaleString("es-CO")}<br/>
          📅 Fecha: ${new Date(p.fecha_pago).toLocaleString()}<br/>
          Estado: ${p.estado}
        </div>
      `
        )
        .join("");

      Swal.fire({
        title: `Pagos de la factura #${idFactura}`,
        html: lista,
        width: 600
      });

    } catch {
      Swal.fire("Error", "No se pudieron obtener los pagos", "error");
    }
  };

  // -----------------------------
  // Marcar como pagado
  // -----------------------------
  const marcarComoPagado = async (id_pago) => {
    try {
      await api.put(`/pagos/${id_pago}/completar`);
      Swal.fire("Listo", "El pago fue marcado como completado", "success");
      obtenerPagos();
    } catch {
      Swal.fire("Error", "No se pudo actualizar el pago", "error");
    }
  };

  // -----------------------------
  // Eliminar Pago
  // -----------------------------
  const eliminarPago = async (id_pago) => {
    Swal.fire({
      title: "¿Eliminar pago?",
      icon: "warning",
      showCancelButton: true
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          await api.delete(`/pagos/${id_pago}`);
          Swal.fire("Eliminado", "El pago fue eliminado", "success");
          obtenerPagos();
        } catch {
          Swal.fire("Error", "No se pudo eliminar el pago", "error");
        }
      }
    });
  };

  // -----------------------------
  // Filtrar pagos
  // -----------------------------
  const pagosFiltrados = pagos.filter((p) =>
    String(p.monto).includes(filtro) ||
    String(p.estado).toLowerCase().includes(filtro.toLowerCase()) ||
    String(p.id_factura).includes(filtro)
  );

  // -----------------------------
  // PAGINACIÓN
  // -----------------------------
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const pagosPaginados = pagosFiltrados.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(pagosFiltrados.length / rowsPerPage);

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <Container fluid className="p-4">
      <Card className="shadow-sm border-0">
        <Card.Body>

          <div className="d-flex justify-content-between mb-3">
            <Card.Title><i className="fas fa-credit-card me-2"></i> Gestión de Pagos</Card.Title>

            <Button variant="outline-primary" onClick={obtenerPagos} disabled={loading}>
              {loading ? "Cargando..." : "Actualizar"}
            </Button>
          </div>

          {/* Registrar pago */}
          <Card className="p-3 mb-4 bg-light">
            <h6><i className="fas fa-plus me-2 text-primary"></i> Registrar Pago</h6>

            <Row className="g-3">
              <Col md={3}>
                <Form.Label>ID Factura</Form.Label>
                <Form.Control
                  type="number"
                  value={nuevoPago.id_factura}
                  onChange={(e) => setNuevoPago({ ...nuevoPago, id_factura: e.target.value })}
                />
              </Col>

              <Col md={3}>
                <Form.Label>Monto</Form.Label>
                <Form.Control
                  type="number"
                  value={nuevoPago.monto}
                  onChange={(e) => setNuevoPago({ ...nuevoPago, monto: e.target.value })}
                />
              </Col>

              <Col md={3}>
                <Form.Label>Método</Form.Label>
                <Form.Select
                  value={nuevoPago.id_forma_pago}
                  onChange={(e) => setNuevoPago({ ...nuevoPago, id_forma_pago: e.target.value })}
                >
                  {formasPago.map((f) => (
                    <option key={f.id_forma_pago} value={f.id_forma_pago}>{f.nombre}</option>
                  ))}
                </Form.Select>
              </Col>

              <Col md={3} className="d-flex align-items-end">
                <Button className="w-100" variant="success" onClick={crearPago}>
                  Registrar
                </Button>
              </Col>
            </Row>
          </Card>

          {/* TABLA */}
          <Table hover className="align-middle">
              <thead className="table-light">
                <tr>
                  <th>N°</th>
                  <th>Monto</th>
                  <th>Factura</th>
                  <th>Método</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {pagosPaginados.map((p, index) => {
                  
                  // Buscar el método en texto
                  const metodo = formasPago.find(f => f.id_forma_pago === p.id_forma_pago)?.nombre || "Desconocido";

                  return (
                    <tr key={p.id_pago}>
                      
                      {/* Número autoincrementado GLOBAL */}
                      <td>{indexOfFirstRow + index + 1}</td>

                      {/* Monto */}
                      <td>${parseFloat(p.monto).toLocaleString("es-CO")}</td>

                      {/* Número de factura (SOLO TEXTO) */}
                      <td>#{p.id_factura}</td>

                      {/* Método de pago EN TEXTO */}
                      <td>
                        <Badge bg="info">{metodo}</Badge>
                      </td>

                      {/* Fecha */}
                      <td>{new Date(p.fecha_pago).toLocaleString()}</td>

                      {/* Estado */}
                      <td>
                        <Badge bg={p.estado === "completado" ? "success" : "warning"}>
                          {p.estado}
                        </Badge>
                      </td>

                      {/* SOLO botón de ver detalles */}
                      <td>
                        <Button 
                          size="sm" 
                          variant="outline-info" 
                          onClick={() => verPago(p.id_pago)}
                        >
                          <i className="fas fa-eye"></i>
                        </Button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </Table>


          {/* PAGINACIÓN */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-3">
              <Button
                variant="light"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="mx-1"
              >
                «
              </Button>

              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;

                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <Button
                      key={page}
                      variant={page === currentPage ? "primary" : "light"}
                      onClick={() => setCurrentPage(page)}
                      className="mx-1"
                    >
                      {page}
                    </Button>
                  );
                }

                if (page === currentPage - 2 || page === currentPage + 2) {
                  return (
                    <Button key={page} variant="light" disabled className="mx-1">
                      …
                    </Button>
                  );
                }

                return null;
              })}

              <Button
                variant="light"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="mx-1"
              >
                »
              </Button>
            </div>
          )}

        </Card.Body>
      </Card>
    </Container>
  );
};

export default Pagos;
