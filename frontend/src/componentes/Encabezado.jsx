import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useState } from "react";
import "../assets/estilos/inicio.css";

export default function Encabezado() {
  const [expanded, setExpanded] = useState(false);

  return (
    <header className="fixed-top bg-white shadow-sm">
      <Navbar expand="lg" expanded={expanded} className="navbar">
        <Container>
          <Navbar.Brand as={Link} to="/" className="logo d-flex align-items-center">
            <div className="logo-icon me-2">
              <i className="fas fa-tint"></i>
            </div>
            Servilavadora
          </Navbar.Brand>

          <Navbar.Toggle
            aria-controls="basic-navbar-nav"
            onClick={() => setExpanded(expanded ? false : true)}
          />

          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto d-flex align-items-center nav-links">
              <Nav.Link as={Link} to="/login">Iniciar Sesión</Nav.Link>
              <Button as={Link} to="/registro" className="btn btn-primary ms-2">
                Registrarse
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
}
