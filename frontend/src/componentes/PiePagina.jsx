import { Container } from "react-bootstrap";
import "../assets/estilos/inicio.css";

export default function PiePagina() {
  return (
    <footer>
      <Container>
        <div className="footer-content">
          <div className="footer-logo">
            <i className="fas fa-tint"></i> Servilavadora
          </div>
          <p>Tu servicio confiable de alquiler de lavadoras</p>

          <div className="footer-links">
            <a href="#inicio">Inicio</a>
            <a href="#lavadoras">Lavadoras</a>
            <a href="#como-funciona">Cómo Funciona</a>
            <a href="#beneficios">Beneficios</a>
            <a href="/login">Iniciar Sesión</a>
            <a href="/registro">Registrarse</a>
          </div>

          <div className="social-links">
            <a href="#"><i className="fab fa-facebook-f"></i></a>
            <a href="#"><i className="fab fa-twitter"></i></a>
            <a href="#"><i className="fab fa-instagram"></i></a>
            <a href="#"><i className="fab fa-linkedin-in"></i></a>
          </div>

          <div className="copyright">
            © 2025 Servilavadora. Todos los derechos reservados.
          </div>
        </div>
      </Container>
    </footer>
  );
}
