// client/client/Footer.jsx
import { Row, Col, Container } from 'react-bootstrap';
import { 
  Phone, 
  Mail, 
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  MessageCircle
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark text-white mt-5">
      <Container className="py-5">
        <Row className="g-4">
          {/* Logo y Descripción */}
          <Col lg={4} md={6}>
            <div className="mb-4">
              <div className="d-flex align-items-center mb-3">
                <div 
                  className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3"
                  style={{ width: '50px', height: '50px' }}
                >
                  <MessageCircle className="text-white" size={24} />
                </div>
                <h4 className="fw-bold mb-0 text-white">Servilavadora</h4>
              </div>
              <p className="text-light mb-4">
                El servicio de alquiler de lavadoras más confiable y económico. 
                Simplificamos tu vida con tecnología y servicio de calidad.
              </p>
              
              {/* Redes Sociales */}
              <div className="d-flex gap-3">
                <a 
                  href="#" 
                  className="text-white text-decoration-none d-flex align-items-center justify-content-center rounded-circle"
                  style={{ 
                    width: '40px', 
                    height: '40px', 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#1877F2';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  <Facebook size={20} />
                </a>
                <a 
                  href="#" 
                  className="text-white text-decoration-none d-flex align-items-center justify-content-center rounded-circle"
                  style={{ 
                    width: '40px', 
                    height: '40px', 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#1DA1F2';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  <Twitter size={20} />
                </a>
                <a 
                  href="#" 
                  className="text-white text-decoration-none d-flex align-items-center justify-content-center rounded-circle"
                  style={{ 
                    width: '40px', 
                    height: '40px', 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#E4405F';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  <Instagram size={20} />
                </a>
              </div>
            </div>
          </Col>

          {/* Enlaces Rápidos */}
          <Col lg={2} md={6}>
            <h5 className="fw-bold mb-4 text-white">Enlaces Rápidos</h5>
            <div className="d-flex flex-column gap-3">
              <a 
                href="/cliente/inicio" 
                className="text-light text-decoration-none"
                style={{ transition: 'all 0.3s ease' }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#00C6B3';
                  e.target.style.paddingLeft = '5px';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = 'rgba(255, 255, 255, 0.7)';
                  e.target.style.paddingLeft = '0';
                }}
              >
                Mis Reservas
              </a>
              <a 
                href="/cliente/servicios" 
                className="text-light text-decoration-none"
                style={{ transition: 'all 0.3s ease' }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#00C6B3';
                  e.target.style.paddingLeft = '5px';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = 'rgba(255, 255, 255, 0.7)';
                  e.target.style.paddingLeft = '0';
                }}
              >
                Lavadoras
              </a>
              <a 
                href="/cliente/historial" 
                className="text-light text-decoration-none"
                style={{ transition: 'all 0.3s ease' }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#00C6B3';
                  e.target.style.paddingLeft = '5px';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = 'rgba(255, 255, 255, 0.7)';
                  e.target.style.paddingLeft = '0';
                }}
              >
                Historial
              </a>
              <a 
                href="/cliente/perfil" 
                className="text-light text-decoration-none"
                style={{ transition: 'all 0.3s ease' }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#00C6B3';
                  e.target.style.paddingLeft = '5px';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = 'rgba(255, 255, 255, 0.7)';
                  e.target.style.paddingLeft = '0';
                }}
              >
                Mi Perfil
              </a>
            </div>
          </Col>

          {/* Soporte */}
          <Col lg={2} md={6}>
            <h5 className="fw-bold mb-4 text-white">Soporte</h5>
            <div className="d-flex flex-column gap-3">
              <a 
                href="/cliente/soporte" 
                className="text-light text-decoration-none"
                style={{ transition: 'all 0.3s ease' }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#00C6B3';
                  e.target.style.paddingLeft = '5px';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = 'rgba(255, 255, 255, 0.7)';
                  e.target.style.paddingLeft = '0';
                }}
              >
                Centro de Ayuda
              </a>
              <a 
                href="/cliente/soporte" 
                className="text-light text-decoration-none"
                style={{ transition: 'all 0.3s ease' }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#00C6B3';
                  e.target.style.paddingLeft = '5px';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = 'rgba(255, 255, 255, 0.7)';
                  e.target.style.paddingLeft = '0';
                }}
              >
                Contacto
              </a>
              <a 
                href="#" 
                className="text-light text-decoration-none"
                style={{ transition: 'all 0.3s ease' }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#00C6B3';
                  e.target.style.paddingLeft = '5px';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = 'rgba(255, 255, 255, 0.7)';
                  e.target.style.paddingLeft = '0';
                }}
              >
                Términos y Condiciones
              </a>
              <a 
                href="#" 
                className="text-light text-decoration-none"
                style={{ transition: 'all 0.3s ease' }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#00C6B3';
                  e.target.style.paddingLeft = '5px';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = 'rgba(255, 255, 255, 0.7)';
                  e.target.style.paddingLeft = '0';
                }}
              >
                Política de Privacidad
              </a>
            </div>
          </Col>

          {/* Contacto */}
          <Col lg={4} md={6}>
            <h5 className="fw-bold mb-4 text-white">Contacto</h5>
            <div className="d-flex flex-column gap-4">
              <div className="d-flex align-items-center">
                <div 
                  className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3"
                  style={{ width: '40px', height: '40px', flexShrink: 0 }}
                >
                  <Phone size={20} className="text-white" />
                </div>
                <div>
                  <div className="fw-bold text-white">Teléfono</div>
                  <div className="text-light">+57 1 234 5678</div>
                </div>
              </div>

              <div className="d-flex align-items-center">
                <div 
                  className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3"
                  style={{ width: '40px', height: '40px', flexShrink: 0 }}
                >
                  <Mail size={20} className="text-white" />
                </div>
                <div>
                  <div className="fw-bold text-white">Email</div>
                  <div className="text-light">hola@servilavadora.com</div>
                </div>
              </div>

              <div className="d-flex align-items-center">
                <div 
                  className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3"
                  style={{ width: '40px', height: '40px', flexShrink: 0 }}
                >
                  <MapPin size={20} className="text-white" />
                </div>
                <div>
                  <div className="fw-bold text-white">Dirección</div>
                  <div className="text-light">Bogotá, Colombia</div>
                </div>
              </div>
            </div>

            {/* Horario de Atención */}
            <div className="mt-4 p-3 rounded" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
              <div className="fw-bold text-white mb-2">Horario de Atención</div>
              <div className="text-light small">
                Lunes a Viernes: 8:00 AM - 6:00 PM<br />
                Sábados: 9:00 AM - 2:00 PM<br />
                Domingos: Cerrado
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Línea inferior */}
      <div className="border-top border-secondary">
        <Container>
          <Row className="py-4">
            <Col className="text-center">
              <p className="text-light mb-0">
                &copy; {currentYear} Servilavadora. Todos los derechos reservados.
              </p>
              <small className="text-muted">
                Desarrollado con ❤️ para simplificar tu vida
              </small>
            </Col>
          </Row>
        </Container>
      </div>
    </footer>
  );
}