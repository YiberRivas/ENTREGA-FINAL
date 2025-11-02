import { Container, Row, Col } from "react-bootstrap";
import Encabezado from "../componentes/Encabezado";
import TarjetaLavadora from "../componentes/TarjetaLavadora";
import PiePagina from "../componentes/PiePagina";
import "../assets/estilos/inicio.css";

export default function Inicio() {
  return (
    <div className="Inicio">
      <Encabezado />

      {/* HERO SECTION */}
      <section className="hero" id="inicio">
        <Container className="d-flex flex-column flex-lg-row align-items-center justify-content-between">
          <div className="hero-content text-center text-lg-start">
            <div className="hero-badge">
              <i className="fas fa-star"></i> Servicio confiable de alquiler de lavadoras
            </div>
            <h1>
              Alquiler de Lavadoras <span className="gradient-text">Fácil y Rápido</span>
            </h1>
            <p>
              Alquila lavadoras de alta calidad por horas. Perfecto para tu hogar, negocio o eventos especiales.
              Solo $3.000 por hora, máximo 4 horas.
            </p>
            <div className="hero-actions d-flex gap-2 justify-content-center justify-content-lg-start">
              <a href="#lavadoras" className="btn btn-primary">Explorar Lavadoras</a>
              <a href="/registro" className="btn btn-outline">Comenzar Ahora</a>
            </div>
          </div>

          <div className="hero-image mt-4 mt-lg-0">
            <img
              src="https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=1000&q=80"
              alt="Lavadoras modernas"
            />
          </div>
        </Container>
      </section>

      {/* SECCIÓN LAVADORAS */}
      <section id="lavadoras" className="bg-light">
        <Container>
          <div className="section-title text-center">
            <h2>Lavadoras Disponibles</h2>
            <p>Descubre nuestras lavadoras de alta calidad listas para alquilar</p>
          </div>
          <Row className="washers-grid">
            <Col>
              <TarjetaLavadora
                nombre="LG WashTower Premium"
                estado="Disponible"
                descripcion="Lavadora de carga frontal de alta eficiencia con tecnología AI DD y control inteligente."
                ubicacion="Centro Comercial Santafé - Bogotá"
                capacidad="12 kg"
                precio="$3.000"
                imagen="https://www.pngfind.com/pngs/m/464-4649661_lavadora-semiautomatica-12-kg-midea-hd-png-download.png"
              />
            </Col>
          </Row>
        </Container>
      </section>

      <PiePagina />
    </div>
  );
}
