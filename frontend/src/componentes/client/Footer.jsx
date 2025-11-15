import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="dashboard-footer">
      <Container>
        <Row>
          <Col md={3}>
            <h5>Servilavadora</h5>
            <p>El servicio de alquiler de lavadoras más confiable y económico.</p>
            <div className="social-links">
              <a href="#"><i className="fab fa-facebook-f"></i></a>
              <a href="#"><i className="fab fa-twitter"></i></a>
              <a href="#"><i className="fab fa-instagram"></i></a>
            </div>
          </Col>
          <Col md={3}>
            <h5>Enlaces Rápidos</h5>
            <a href="#reservas">Mis Reservas</a>
            <a href="#lavadoras">Lavadoras</a>
            <a href="#historial">Historial</a>
            <a href="#perfil">Mi Perfil</a>
          </Col>
          <Col md={3}>
            <h5>Soporte</h5>
            <a href="#">Centro de Ayuda</a>
            <a href="#">Contacto</a>
            <a href="#">Términos y Condiciones</a>
            <a href="#">Política de Privacidad</a>
          </Col>
          <Col md={3}>
            <h5>Contacto</h5>
            <p><i className="fas fa-phone"></i> +57 1 234 5678</p>
            <p><i className="fas fa-envelope"></i> hola@servilavadora.com</p>
            <p><i className="fas fa-map-marker-alt"></i> Bogotá, Colombia</p>
          </Col>
        </Row>
        <Row className="mt-4">
          <Col className="text-center">
            <p>&copy; 2025 Servilavadora. Todos los derechos reservados.</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;