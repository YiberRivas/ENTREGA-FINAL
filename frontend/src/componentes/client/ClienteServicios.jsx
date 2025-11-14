import { useEffect, useState } from "react";
import { Card, Button, Row, Col, Spinner } from "react-bootstrap";
import api from "../../api/axiosConfig";
import Swal from "sweetalert2";

export default function ClienteServicios() {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarServicios();
  }, []);

  const cargarServicios = async () => {
    try {
      const res = await api.get("/servicios");
      setServicios(res.data);
    } catch {
      Swal.fire("Error", "No se pudieron cargar los servicios", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAgendar = async (id) => {
    try {
      await api.post(`/clientes/agendar/${id}`);
      Swal.fire("Éxito", "Servicio agendado correctamente", "success");
    } catch {
      Swal.fire("Error", "No se pudo agendar el servicio", "error");
    }
  };

  if (loading) return <Spinner animation="border" className="d-block mx-auto mt-5" />;

  return (
    <>
      <h4 className="fw-bold text-primary mb-4">Servicios Disponibles</h4>
      <Row>
        {servicios.map((s) => (
          <Col md={4} key={s.id} className="mb-4">
            <Card className="shadow-sm border-0">
              <Card.Body>
                <Card.Title className="fw-semibold">{s.nombre}</Card.Title>
                <Card.Text>{s.descripcion}</Card.Text>
                <h6 className="text-success fw-bold">${s.precio}</h6>
                <Button variant="primary" size="sm" onClick={() => handleAgendar(s.id)}>
                  <i className="fas fa-calendar-plus me-2"></i> Agendar
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
}
