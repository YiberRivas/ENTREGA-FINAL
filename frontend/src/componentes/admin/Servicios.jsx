import React, { useEffect, useState } from "react";
import {
  Container,
  Spinner,
  Table,
  Button,
  Form,
  Row,
  Col,
  Pagination,
} from "react-bootstrap";
import Swal from "sweetalert2";
import api from "../../api/axiosConfig";
import AdminSidebar from "../../componentes/admin/AdminSidebar";

const Servicios = () => {
  const [servicios, setServicios] = useState([]);
  const [filteredServicios, setFilteredServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  // 🔹 Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    obtenerServicios();
  }, []);

  const obtenerServicios = async () => {
    try {
      setLoading(true);
      const response = await api.get("/servicios/");
      setServicios(response.data);
      setFilteredServicios(response.data);
    } catch (error) {
      console.error("Error al cargar servicios:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.detail ||
          "No se pudieron cargar los servicios.",
      });
    } finally {
      setLoading(false);
    }
  };

  // 🔍 Filtrar servicios
  useEffect(() => {
    const filtrados = servicios.filter((s) =>
      s.nombre_servicio?.toLowerCase().includes(busqueda.toLowerCase())
    );
    setFilteredServicios(filtrados);
    setCurrentPage(1);
  }, [busqueda, servicios]);

  // 🔢 Calcular servicios visibles
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentServicios = filteredServicios.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredServicios.length / itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleView = (s) => {
    Swal.fire({
      icon: "info",
      title: "Detalle del Servicio",
      html: `
        <b>ID:</b> ${s.id_servicio}<br/>
        <b>Nombre:</b> ${s.nombre_servicio}<br/>
        <b>Precio base:</b> $${(s.precio_base || 0).toLocaleString("es-CO")}<br/>
        <b>Duración:</b> ${s.duracion_minutos || 0} minutos<br/>
        <b>Descripción:</b> ${s.descripcion || "Sin descripción"}<br/>
        <b>Activo:</b> ${s.activo ? "Sí" : "No"}
      `,
      confirmButtonColor: "#17a2b8",
    });
  };

  const handleDelete = async (s) => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: "¿Eliminar servicio?",
      text: `Esto eliminará el servicio ${s.nombre_servicio}`,
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (confirm.isConfirmed) {
      try {
        await api.delete(`/servicios/${s.id_servicio}`);
        Swal.fire("Eliminado", "Servicio eliminado correctamente", "success");
        obtenerServicios();
      } catch (error) {
        Swal.fire("Error", "No se pudo eliminar el servicio", "error");
      }
    }
  };

  // 🔹 Mantener 5 filas fijas
  const emptyRows =
    currentServicios.length < itemsPerPage
      ? Array.from({ length: itemsPerPage - currentServicios.length })
      : [];

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <AdminSidebar />
      <div className="flex-grow-1 p-4" style={{ background: "#f8f9fa" }}>
        <h4 className="mb-4 text-info fw-bold">
          <i className="fas fa-cogs me-2"></i> Servicios Disponibles
        </h4>

        {/* 🔎 Filtro y actualización */}
        <Row className="mb-3">
          <Col md={5}>
            <Form.Control
              type="text"
              placeholder="Buscar servicio..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </Col>
          <Col md="auto">
            <Button variant="info" className="text-white" onClick={obtenerServicios}>
              <i className="fas fa-sync-alt me-2"></i>Actualizar
            </Button>
          </Col>
        </Row>

        {/* 🧾 Tabla con paginación */}
        {loading ? (
          <div
            className="d-flex flex-column justify-content-center align-items-center"
            style={{ height: "60vh" }}
          >
            <Spinner animation="border" variant="info" />
            <p className="mt-3 text-muted">Cargando servicios...</p>
          </div>
        ) : (
          <Container fluid className="bg-white shadow-sm rounded p-3">
            <div style={{ minHeight: "400px" }}>
              <Table
                hover
                responsive
                className="align-middle"
                style={{ tableLayout: "fixed" }}
              >
                <thead className="table-light sticky-top" style={{ top: 0 }}>
                  <tr>
                    <th style={{ width: "10%", position: "sticky", left: 0, background: "#f8f9fa" }}>ID</th>
                    <th style={{ width: "30%" }}>Servicio</th>
                    <th style={{ width: "20%" }}>Precio Base</th>
                    <th style={{ width: "20%" }}>Duración</th>
                    <th style={{ width: "20%" }} className="text-end">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentServicios.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center text-muted">
                        No hay servicios registrados
                      </td>
                    </tr>
                  ) : (
                    <>
                      {currentServicios.map((s) => (
                        <tr key={s.id_servicio} style={{ height: "60px" }}>
                          <td style={{ position: "sticky", left: 0, background: "#fff" }}>
                            {s.id_servicio}
                          </td>
                          <td>{s.nombre_servicio}</td>
                          <td>${(s.precio_base || 0).toLocaleString("es-CO")}</td>
                          <td>{s.duracion_minutos} min</td>
                          <td className="text-end">
                            <Button
                              variant="info"
                              size="sm"
                              className="me-2"
                              onClick={() => handleView(s)}
                            >
                              <i className="fas fa-eye"></i>
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDelete(s)}
                            >
                              <i className="fas fa-trash"></i>
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {/* Filas vacías */}
                      {emptyRows.map((_, i) => (
                        <tr key={`empty-${i}`} style={{ height: "60px" }}>
                          <td colSpan="5"></td>
                        </tr>
                      ))}
                    </>
                  )}
                </tbody>
              </Table>
            </div>

            {/* 🔸 Controles de paginación */}
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
          </Container>
        )}
      </div>
    </div>
  );
};

export default Servicios;
