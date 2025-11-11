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
  Pagination,
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
      console.error("Error al cargar usuarios:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.detail ||
          "No se pudieron cargar los usuarios.",
      });
    } finally {
      setLoading(false);
    }
  };

  // 🔍 Filtrar usuarios según búsqueda y estado
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

  // 🔢 Calcular usuarios visibles por página
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

  const formatearFecha = (fecha) => {
    if (!fecha) return "No disponible";
    try {
      const f = new Date(fecha);
      return f.toLocaleString("es-CO", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Formato inválido";
    }
  };

  const handleView = (user) => {
    setUsuarioSeleccionado(user);
    setShowModal(true);
  };

  const handleDelete = async (user) => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: "¿Eliminar usuario?",
      text: `Esto eliminará al usuario ${user.usuario || user.username}`,
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (confirm.isConfirmed) {
      try {
        await api.delete(`/usuarios/${user.id_usuario || user.id}`);
        Swal.fire("Eliminado", "El usuario fue eliminado.", "success");
        obtenerUsuarios();
      } catch (error) {
        Swal.fire("Error", "No se pudo eliminar el usuario.", "error");
      }
    }
  };

  // 🔹 Mantener 5 filas visibles aunque haya menos datos
  const emptyRows =
    currentUsuarios.length < itemsPerPage
      ? Array.from({ length: itemsPerPage - currentUsuarios.length })
      : [];

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <AdminSidebar />
      <div className="flex-grow-1 p-4" style={{ background: "#f8f9fa" }}>
        <h4 className="mb-4 text-info fw-bold">
          <i className="fas fa-users me-2"></i> Usuarios Registrados
        </h4>

        {/* 🔎 Barra de búsqueda y filtro */}
        <Row className="mb-3">
          <Col md={5}>
            <Form.Control
              type="text"
              placeholder="Buscar por nombre de usuario..."
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
            <Button
              variant="info"
              className="text-white fw-semibold"
              onClick={obtenerUsuarios}
            >
              <i className="fas fa-sync-alt me-2"></i>Actualizar
            </Button>
          </Col>
        </Row>

        {/* 🧾 Tabla de usuarios */}
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
              <Table
                hover
                responsive
                className="align-middle"
                style={{ tableLayout: "fixed" }}
              >
                <thead className="table-light sticky-top" style={{ top: 0 }}>
                  <tr>
                    <th style={{ width: "20%" }}>ID</th>
                    <th style={{ width: "20%" }}>Usuario</th>
                    <th style={{ width: "25%" }}>Activo</th>
                    <th style={{ width: "25%" }}>Fecha de Creación</th>
                    <th style={{ width: "20%" }} className="text-end">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsuarios.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center text-muted">
                        No hay usuarios registrados
                      </td>
                    </tr>
                  ) : (
                    <>
                      {currentUsuarios.map((u) => (
                        <tr key={u.id_usuario || u.id} style={{ height: "60px" }}>
                          <td>{u.id_usuario || u.id}</td>
                          <td>{u.usuario || u.username}</td>
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
                          <td className="text-end">
                            <Button
                              variant="info"
                              size="sm"
                              className="me-2"
                              onClick={() => handleView(u)}
                            >
                              <i className="fas fa-eye"></i>
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDelete(u)}
                            >
                              <i className="fas fa-trash"></i>
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {/* 🔹 Filas vacías para mantener la altura fija */}
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

      {/* 🪟 Modal de información */}
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
              <p>
                <strong>ID:</strong>{" "}
                {usuarioSeleccionado.id_usuario || usuarioSeleccionado.id}
              </p>
              <p>
                <strong>Usuario:</strong>{" "}
                {usuarioSeleccionado.usuario || usuarioSeleccionado.username}
              </p>
              <p>
                <strong>Activo:</strong>{" "}
                {usuarioSeleccionado.activo ? "Sí" : "No"}
              </p>
              <p>
                <strong>Fecha de creación:</strong>{" "}
                {formatearFecha(usuarioSeleccionado.fecha_creacion)}
              </p>
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
