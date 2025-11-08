import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useState } from "react";
import "../assets/estilos/inicio.css";
<<<<<<< HEAD
import Logo from "../assets/Logo-Serv.png";
=======
import Logo from "../assets/img/Logo-Serv.png";
>>>>>>> 99875aa0c7e4d1ba439d7cb0423cfe923082821c

export default function Encabezado() {
  const [expanded, setExpanded] = useState(false);

  return (
    <header className="fixed-top bg-white shadow-sm">
      <Navbar expand="lg" expanded={expanded} className="navbar custom-navbar">
        <Container>
          <Navbar.Brand as={Link} to="/" className="logo-brand" onClick={() => setExpanded(false)}>
            <div className="logo-container">
              <div className="logo-image-container">
                <img src={Logo} alt="Servilavadora" className="logo-img" /> 
              </div>
            </div>
          </Navbar.Brand>

          <Navbar.Toggle
            aria-controls="basic-navbar-nav"
            onClick={() => setExpanded(expanded ? false : true)}
            className="navbar-toggler-custom"
          />

          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto d-flex align-items-center nav-links">
              <Nav.Link as={Link} to="/login" onClick={() => setExpanded(false)}>
                Iniciar Sesión
              </Nav.Link>
              <Button as={Link} to="/registro" className="btn btn-primary ms-2" onClick={() => setExpanded(false)}>
                Registrarse
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
}