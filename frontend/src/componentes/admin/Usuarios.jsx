import React, { useEffect, useState } from "react";
import {
  Container,
  Spinner,
  Table,
  Button,
  Modal,
  Form,
  Row,
  Col,
} from "react-bootstrap";
import Swal from "sweetalert2";
import api from "../../api/axiosConfig";
import AdminSidebar from "../../componentes/admin/AdminSidebar";

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroActivo, setFiltroActivo] = useState("todos");
  const [showModal, setShowModal] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  // 🔹 Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  const obtenerUsuarios = async () => {
    try {
      setLoading(true);
      const response = await api.get("/usuarios/");
      setUsuarios(response.data);
      setFilteredUsuarios(response.data);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los usuarios.",
      });
    } finally {
      setLoading(false);
    }
  };

  // 🔍 Filtrar usuarios
  useEffect(() => {
    let filtrados = usuarios.filter((u) =>
      (u.usuario || u.username || "")
        .toLowerCase()
        .includes(busqueda.toLowerCase())
    );

    if (filtroActivo !== "todos") {
      filtrados = filtrados.filter((u) =>
        filtroActivo === "activos" ? u.activo : !u.activo
      );
    }

    setFilteredUsuarios(filtrados);
    setCurrentPage(1);
  }, [busqueda, filtroActivo, usuarios]);

  // 🔢 Cálculo de paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsuarios = filteredUsuarios.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredUsuarios.length / itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // 🔹 Formato de fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return "No disponible";

    const f = new Date(fecha);
    if (isNaN(f)) return "Formato inválido";

    return f.toLocaleString("es-CO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 🔎 Ver detalle
  const handleView = (user) => {
    setUsuarioSeleccionado(user);
    setShowModal(true);
  };

  // 🗑 Eliminar
  const handleDelete = async (user) => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: "¿Eliminar usuario?",
      text: `Esto eliminará al usuario ${user.usuario}`,
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, eliminar",
    });

    if (confirm.isConfirmed) {
      try {
        await api.delete(`/usuarios/${user.id_usuario}`);
        Swal.fire("Eliminado", "El usuario fue eliminado.", "success");
        obtenerUsuarios();
      } catch (error) {
        Swal.fire("Error", "No se pudo eliminar el usuario.", "error");
      }
    }
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <AdminSidebar />

      <div className="flex-grow-1 p-4" style={{ background: "#f8f9fa" }}>
        <h4 className="mb-4 text-info fw-bold">
          <i className="fas fa-users me-2"></i> Usuarios Registrados
        </h4>

        {/* 🔎 Filtros */}
        <Row className="mb-3">
          <Col md={5}>
            <Form.Control
              type="text"
              placeholder="Buscar usuario..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </Col>

          <Col md={3}>
            <Form.Select
              value={filtroActivo}
              onChange={(e) => setFiltroActivo(e.target.value)}
            >
              <option value="todos">Todos</option>
              <option value="activos">Activos</option>
              <option value="inactivos">Inactivos</option>
            </Form.Select>
          </Col>

          <Col md={2}>
            <Button variant="info" className="text-white" onClick={obtenerUsuarios}>
              <i className="fas fa-sync-alt me-2"></i>
              Actualizar
            </Button>
          </Col>
        </Row>

        {/* 🧾 Tabla */}
        {loading ? (
          <div
            className="d-flex flex-column justify-content-center align-items-center"
            style={{ height: "60vh" }}
          >
            <Spinner animation="border" variant="info" />
            <p className="mt-3 text-muted">Cargando usuarios...</p>
          </div>
        ) : (
          <Container fluid className="bg-white shadow-sm rounded p-3">
            <div style={{ minHeight: "400px" }}>
              <Table hover responsive className="align-middle text-center">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "10%" }}>N°</th>
                    <th style={{ width: "25%" }}>Usuario</th>
                    <th style={{ width: "20%" }}>Activo</th>
                    <th style={{ width: "25%" }}>Fecha de Creación</th>
                    <th style={{ width: "20%" }}>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {currentUsuarios.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-muted">
                        No hay usuarios registrados
                      </td>
                    </tr>
                  ) : (
                    currentUsuarios.map((u, index) => (
                      <tr key={u.id_usuario}>
                        {/* 🔥 Número auto-incrementable */}
                        <td>{indexOfFirstItem + index + 1}</td>

                        <td>{u.usuario}</td>

                        <td>
                          <span
                            className={`badge ${
                              u.activo ? "bg-success" : "bg-secondary"
                            }`}
                          >
                            {u.activo ? "Activo" : "Inactivo"}
                          </span>
                        </td>

                        <td>{formatearFecha(u.fecha_creacion)}</td>

                        <td>
                          <Button
                            size="sm"
                            variant="info"
                            className="me-2"
                            onClick={() => handleView(u)}
                          >
                            <i className="fas fa-eye"></i>
                          </Button>

                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDelete(u)}
                          >
                            <i className="fas fa-trash"></i>
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>

            {/* 🔥 PAGINACIÓN IGUAL A PAGOS */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-center mt-3">
                <Button
                  variant="light"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
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
                        variant={page === currentPage ? "info" : "light"}
                        onClick={() => handlePageChange(page)}
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
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="mx-1"
                >
                  »
                </Button>
              </div>
            )}
          </Container>
        )}
      </div>

      {/* 🔹 Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="md">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-user-circle me-2 text-info"></i>
            Información del Usuario
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {usuarioSeleccionado && (
            <>
              <p><strong>Usuario:</strong> {usuarioSeleccionado.usuario}</p>
              <p><strong>Activo:</strong> {usuarioSeleccionado.activo ? "Sí" : "No"}</p>
              <p><strong>Fecha creación:</strong> {formatearFecha(usuarioSeleccionado.fecha_creacion)}</p>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Usuarios;
