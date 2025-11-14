import React, { useEffect, useState } from "react";
import {
  Container,
  Table,
  Spinner,
  Card,
  Badge,
  Button,
  Pagination,
} from "react-bootstrap";
import Swal from "sweetalert2";
import api from "../../api/axiosConfig";
import AdminSidebar from "./AdminSidebar";
import html2pdf from "html2pdf.js";

const Facturas = () => {
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const cargarFacturas = async () => {
    setLoading(true);
    try {
      const response = await api.get("/facturas/");
      if (Array.isArray(response.data)) {
        setFacturas(response.data);
      } else {
        Swal.fire("Advertencia", "El formato de datos no es válido", "warning");
        setFacturas([]);
      }
    } catch (error) {
      const mensajeError = error.response?.data?.detail || "No se pudieron cargar las facturas";
      Swal.fire({
        icon: "error",
        title: "Error al cargar facturas",
        text: mensajeError,
      });
      setFacturas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarFacturas();
  }, []);

  const getBadge = (estado) => {
    const colors = {
      emitida: "warning",
      pagada: "success",
      anulada: "danger",
    };
    const estadoLower = estado?.toLowerCase() || "desconocido";
    const color = colors[estadoLower] || "secondary";
    const texto = estado ? estado.charAt(0).toUpperCase() + estado.slice(1) : "Desconocido";
    return <Badge bg={color}>{texto}</Badge>;
  };

  const verFactura = (id) => {
    const url = `http://127.0.0.1:8000/facturas/ver/${id}`;
    window.open(url, "_blank");
  };

  const descargarPDF = async (id) => {
    try {
      Swal.fire({
        title: "Generando PDF...",
        text: "Por favor espera",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const res = await fetch(`http://127.0.0.1:8000/facturas/ver/${id}`);
      if (!res.ok) throw new Error(`Error ${res.status}: Factura no encontrada`);

      const html = await res.text();
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;
      const facturaElement = tempDiv.querySelector("body") || tempDiv;

      const options = {
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: `Factura_${id}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      };

      await html2pdf().set(options).from(facturaElement).save();
      Swal.fire({
        icon: "success",
        title: "PDF generado",
        text: "La factura se descargó correctamente",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error al generar PDF",
        text: error.message || "No se pudo generar el PDF",
      });
    }
  };

  const getNombreCliente = (f) => {
    if (!f.persona) return "Sin cliente";
    const nombres = f.persona.nombres || "";
    const apellidos = f.persona.apellidos || "";
    return `${nombres} ${apellidos}`.trim() || "Sin nombre";
  };

  const formatearTotal = (t) => {
    const num = parseFloat(t);
    return isNaN(num)
      ? "$0"
      : `$${num.toLocaleString("es-CO", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin fecha";
    const d = new Date(fecha);
    return isNaN(d.getTime())
      ? "Fecha inválida"
      : d.toLocaleString("es-CO", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });
  };

  // 🔢 Paginación
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentFacturas = facturas.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(facturas.length / itemsPerPage);
  const emptyRows = currentFacturas.length < itemsPerPage
    ? Array.from({ length: itemsPerPage - currentFacturas.length })
    : [];

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <AdminSidebar />
      <div className="flex-grow-1 p-4" style={{ background: "#f8f9fa" }}>
        <Container fluid>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="text-info fw-bold mb-0">
              <i className="fas fa-file-invoice me-2"></i>
              Facturas
            </h4>
            <Button
              variant="secondary"
              size="sm"
              onClick={cargarFacturas}
              disabled={loading}
            >
              <i className="fas fa-sync-alt me-1"></i> Refrescar
            </Button>
          </div>

          <Card className="shadow-sm border-0">
            <Card.Body>
              <Card.Title className="fw-bold mb-3 d-flex align-items-center justify-content-between">
                <span>
                  <i className="fas fa-list me-2 text-primary"></i>
                  Facturas Emitidas
                </span>
                <Badge bg="info" pill>
                  {facturas.length}
                </Badge>
              </Card.Title>

              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="info" style={{ width: "3rem", height: "3rem" }} />
                  <p className="mt-3 text-muted">Cargando facturas...</p>
                </div>
              ) : (
                <div style={{ minHeight: "400px" }}>
                  <div className="table-responsive">
                    <Table
                      bordered
                      hover
                      className="align-middle text-center mb-0"
                      style={{ tableLayout: "fixed" }}
                    >
                      <thead className="table-light sticky-top" style={{ top: 0 }}>
                        <tr>
                          <th style={{ width: "8%", position: "sticky", left: 0, background: "#f8f9fa" }}>ID</th>
                          <th style={{ width: "20%" }}>Cliente</th>
                          <th>Correo</th>
                          <th style={{ width: "12%" }}>Total</th>
                          <th style={{ width: "10%" }}>Estado</th>
                          <th>Forma de Pago</th>
                          <th style={{ width: "15%" }}>Fecha</th>
                          <th style={{ width: "12%" }}>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentFacturas.length === 0 ? (
                          <tr>
                            <td colSpan="8" className="text-muted py-5">
                              <i className="fas fa-inbox fa-3x mb-3 d-block"></i>
                              No hay facturas registradas
                            </td>
                          </tr>
                        ) : (
                          <>
                            {currentFacturas.map((f) => (
                              <tr key={f.id_factura} style={{ height: "60px" }}>
                                <td
                                  className="fw-bold"
                                  style={{ position: "sticky", left: 0, background: "#fff" }}
                                >
                                  #{f.id_factura}
                                </td>
                                <td className="text-start">{getNombreCliente(f)}</td>
                                <td><small>{f.persona?.correo || "N/A"}</small></td>
                                <td className="fw-bold text-success">
                                  {formatearTotal(f.total)}
                                </td>
                                <td>{getBadge(f.estado)}</td>
                                <td>{f.forma_pago?.nombre_forma || "N/A"}</td>
                                <td><small>{formatearFecha(f.fecha)}</small></td>
                                <td>
                                  <div className="d-flex justify-content-center gap-1">
                                    <Button
                                      size="sm"
                                      variant="info"
                                      onClick={() => verFactura(f.id_factura)}
                                      title="Ver factura"
                                    >
                                      <i className="fas fa-eye"></i>
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="success"
                                      onClick={() => descargarPDF(f.id_factura)}
                                      title="Descargar PDF"
                                    >
                                      <i className="fas fa-file-pdf"></i>
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                            {emptyRows.map((_, i) => (
                              <tr key={`empty-${i}`} style={{ height: "60px" }}>
                                <td colSpan="8"></td>
                              </tr>
                            ))}
                          </>
                        )}
                      </tbody>
                    </Table>
                  </div>

                  {/* 🔸 Paginación */}
                  {totalPages > 1 && (
                    <div className="d-flex justify-content-center mt-3">
                      <Pagination>
                        <Pagination.Prev
                          disabled={currentPage === 1}
                          onClick={() => handlePageChange(currentPage - 1)}
                        />
                        {[...Array(totalPages)].map((_, i) => (
                          <Pagination.Item
                            key={i + 1}
                            active={i + 1 === currentPage}
                            onClick={() => handlePageChange(i + 1)}
                          >
                            {i + 1}
                          </Pagination.Item>
                        ))}
                        <Pagination.Next
                          disabled={currentPage === totalPages}
                          onClick={() => handlePageChange(currentPage + 1)}
                        />
                      </Pagination>
                    </div>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Container>
      </div>
    </div>
  );
};

export default Facturas;
