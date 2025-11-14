import { Container, Row, Col } from "react-bootstrap";
import Encabezado from "../componentes/Encabezado";
import TarjetaLavadora from "../componentes/TarjetaLavadora";
import PiePagina from "../componentes/PiePagina";
import "../assets/estilos/inicio.css";

export default function Inicio() {
  const lavadoras = [
    {
      nombre: "LG WashTower Premium",
      estado: "Disponible",
      descripcion: "Lavadora de carga frontal de alta eficiencia con tecnología AI DD y control inteligente.",
      ubicacion: "Centro Comercial Santafé - Bogotá",
      capacidad: "12 kg",
      precio: "$3.000",
      imagen: "https://www.pngfind.com/pngs/m/464-4649661_lavadora-semiautomatica-12-kg-midea-hd-png-download.png"
    },
    {
      nombre: "Samsung EcoBubble",
      estado: "Disponible",
      descripcion: "Lavadora con tecnología EcoBubble que lava eficazmente con burbujas incluso en agua fría.",
      ubicacion: "Centro Comercial Unicentro - Bogotá",
      capacidad: "10 kg",
      precio: "$3.000",
      /* imagen: "://images.samsung.com/is/image/samsung/p6pim/co/ww90t554dan-gallery-532825812?$650_519_PNG$" */
    },
    {
      nombre: "Mabe Lma11700pbbo",
      estado: "En mantenimiento",
      descripcion: "Lavadora automática con sistema de lavado por agitador y múltiples programas.",
      ubicacion: "Chapinero Alto - Bogotá",
      capacidad: "17 kg",
      precio: "$3.000",
      imagen: "https://www.mabe.com.co/wp-content/uploads/2023/06/LMA11700PBBO-1.png"
    }
  ];

  const beneficios = [
    {
      icono: "bi bi-clock",
      titulo: "Ahorra Tiempo",
      descripcion: "Evita largos viajes a lavanderías tradicionales"
    },
    {
      icono: "bi bi-cash-coin",
      titulo: "Precios Justos",
      descripcion: "Solo $3.000 por hora, máximo 4 horas de uso"
    },
    {
      icono: "bi bi-geo-alt",
      titulo: "Ubicaciones Cercanas",
      descripcion: "Encuentra lavadoras cerca de tu ubicación"
    },
    {
      icono: "bi bi-shield-check",
      titulo: "Garantía de Calidad",
      descripcion: "Lavadoras modernas y en perfecto estado"
    }
  ];

  const pasos = [
    {
      numero: "1",
      titulo: "Regístrate",
      descripcion: "Crea tu cuenta en menos de 2 minutos"
    },
    {
      numero: "2",
      titulo: "Encuentra",
      descripcion: "Busca lavadoras disponibles cerca de ti"
    },
    {
      numero: "3",
      titulo: "Reserva",
      descripcion: "Selecciona el horario que prefieras"
    },
    {
      numero: "4",
      titulo: "Lava",
      descripcion: "Disfruta de ropa limpia y fresca"
    }
  ];

  return (
    <div className="Inicio">
      <Encabezado />

      {/* HERO SECTION */}
      <section className="hero" id="inicio">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="hero-content">
              <div className="hero-badge">
                <i className="bi bi-star-fill"></i> Servicio confiable de alquiler de lavadoras
              </div>
              <h1>
                Alquiler de Lavadoras <span className="gradient-text">Fácil y Rápido</span>
              </h1>
              <p className="hero-description">
                Alquila lavadoras de alta calidad por horas. Perfecto para tu hogar, negocio o eventos especiales.
                Solo $3.000 por hora, minimo 4 horas en adelante.
              </p>
              <div className="hero-stats">
                <div className="stat">
                  <strong>50+</strong>
                  <span>Lavadoras</span>
                </div>
                <div className="stat">
                  <strong>1K+</strong>
                  <span>Clientes</span>
                </div>
                <div className="stat">
                  <strong>4.8</strong>
                  <span>Calificación</span>
                </div>
              </div>
              <div className="hero-actions">
                <a href="#lavadoras" className="btn btn-primary">Explorar Lavadoras</a>
                <a href="/registro" className="btn btn-outline">Comenzar Ahora</a>
              </div>
            </Col>
            <Col lg={6} className="hero-image">
              <img
                src="https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=1000&q=80"
                alt="Lavadoras modernas"
                className="img-fluid"
              />
            </Col>
          </Row>
        </Container>
      </section>

      {/* CÓMO FUNCIONA */}
      <section id="como-funciona" className="steps-section">
        <Container>
          <div className="section-title text-center">
            <h2>Cómo Funciona</h2>
            <p>Alquilar una lavadora nunca fue tan fácil</p>
          </div>
          <Row>
            {pasos.map((paso, index) => (
              <Col lg={3} md={6} key={index} className="mb-4">
                <div className="step-card">
                  <div className="step-number">{paso.numero}</div>
                  <h4>{paso.titulo}</h4>
                  <p>{paso.descripcion}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* BENEFICIOS */}
      <section id="beneficios" className="benefits-section bg-light">
        <Container>
          <div className="section-title text-center">
            <h2>Beneficios</h2>
            <p>¿Por qué elegir Servilavadora?</p>
          </div>
          <Row>
            {beneficios.map((beneficio, index) => (
              <Col lg={3} md={6} key={index} className="mb-4">
                <div className="benefit-card">
                  <div className="benefit-icon">
                    <i className={beneficio.icono}></i>
                  </div>
                  <h4>{beneficio.titulo}</h4>
                  <p>{beneficio.descripcion}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* LAVADORAS */}
      <section id="lavadoras" className="washers-section">
        <Container>
          <div className="section-title text-center">
            <h2>Lavadoras Disponibles</h2>
            <p>Descubre nuestras lavadoras de alta calidad listas para alquilar</p>
          </div>
          <Row>
            {lavadoras.map((lavadora, index) => (
              <Col lg={4} md={6} key={index} className="mb-4">
                <TarjetaLavadora
                  nombre={lavadora.nombre}
                  estado={lavadora.estado}
                  descripcion={lavadora.descripcion}
                  ubicacion={lavadora.ubicacion}
                  capacidad={lavadora.capacidad}
                  precio={lavadora.precio}
                  imagen={lavadora.imagen}
                />
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      <PiePagina />
    </div>
  );
}