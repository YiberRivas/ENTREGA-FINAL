import { Card, Button } from "react-bootstrap";
import "../assets/estilos/inicio.css";

export default function TarjetaLavadora({ nombre, estado, descripcion, ubicacion, capacidad, precio, imagen }) {
  return (
    <Card className="washer-card fade-in visible">
      <Card.Img variant="top" src={imagen} className="washer-image" />
      <Card.Body className="washer-content">
        <div className="washer-header d-flex justify-content-between align-items-start">
          <h3 className="washer-name">{nombre}</h3>
          <span className={`washer-status ${estado === "Disponible" ? "status-available" : "status-unavailable"}`}>
            {estado}
          </span>
        </div>
        <p className="washer-description">{descripcion}</p>
        <div className="washer-details">
          <div className="detail-item">
            <i className="bi bi-geo-alt"></i> {ubicacion}
          </div>
          <div className="detail-item">
            <i className="bi bi-box"></i> Capacidad: {capacidad}
          </div>
          <div className="detail-item price">
            <i className="bi bi-currency-dollar"></i> {precio} / hora
          </div>
        </div>
        <Button variant="primary" className="w-100" href="/login">
          Iniciar Sesión para Alquilar
        </Button>
      </Card.Body>
    </Card>
  );
}