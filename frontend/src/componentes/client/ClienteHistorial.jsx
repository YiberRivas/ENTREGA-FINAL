import { useEffect, useState } from "react";
import { Table, Spinner, Badge, Card } from "react-bootstrap";
import api from "../../api/axiosConfig";
import Swal from "sweetalert2";

export default function ClienteHistorial() {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    try {
      const res = await api.get("/clientes/historial");
      setHistorial(res.data);
    } catch {
      Swal.fire("Error", "No se pudo cargar el historial", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner animation="border" className="d-block mx-auto mt-5" />;

  return (
    <Card className="shadow-sm border-0">
      <Card.Body>
        <h4 className="fw-bold text-primary mb-4">Historial de Servicios</h4>
        <Table hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Servicio</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {historial.length > 0 ? (
              historial.map((item, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{item.servicio}</td>
                  <td>{item.fecha}</td>
                  <td>
                    <Badge bg={item.estado === "finalizado" ? "success" : "secondary"}>
                      {item.estado}
                    </Badge>
                  </td>
                  <td>${item.total}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center text-muted py-4">
                  No hay registros aún.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}
