import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { Container, Nav, Navbar, Dropdown } from "react-bootstrap";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "../../assets/estilos/ClienteLayout.css"; // Crea este archivo CSS

export default function ClienteLayout() {
  const [usuario, setUsuario] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("usuario");
    if (userData) {
      setUsuario(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    Swal.fire({
      title: "¿Cerrar sesión?",
      text: "¿Estás seguro que deseas salir?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, salir",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        navigate("/inicio");
      }
    });
  };

  return (
    <div className="cliente-layout">
      {/* Navbar superior */}
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-0">
        <Container fluid>
          <Navbar.Brand href="/cliente">
            <i className="bi bi-person-circle"></i> Portal Cliente
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="navbar-cliente" />
          <Navbar.Collapse id="navbar-cliente">
            <Nav className="me-auto">
              <Nav.Link as={NavLink} to="/cliente/perfil">
                <i className="bi bi-person"></i> Mi Perfil
              </Nav.Link>
              <Nav.Link as={NavLink} to="/cliente/servicios">
                <i className="bi bi-tools"></i> Servicios
              </Nav.Link>
              <Nav.Link as={NavLink} to="/cliente/agendamientos">
                <i className="bi bi-calendar-check"></i> Mis Agendamientos
              </Nav.Link>
              <Nav.Link as={NavLink} to="/cliente/historial">
                <i className="bi bi-clock-history"></i> Historial
              </Nav.Link>
            </Nav>
            <Dropdown align="end">
              <Dropdown.Toggle variant="outline-light" id="dropdown-usuario">
                {usuario?.nombre || "Usuario"}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item disabled>
                  <small className="text-muted">{usuario?.correo}</small>
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right"></i> Cerrar Sesión
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Contenido dinámico */}
      <div className="cliente-content">
        <Container fluid className="py-4">
          <Outlet />
        </Container>
      </div>
    </div>
  );
}