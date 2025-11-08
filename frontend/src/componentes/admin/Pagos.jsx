import React, { useEffect, useState } from "react";
import { Container, Card, Table, Form, InputGroup, Badge, Button } from "react-bootstrap";
import Swal from "sweetalert2";
import api from "../../api/axiosConfig";

const Pagos = () => {
  const [pagos, setPagos] = useState([]);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    obtenerPagos();
  }, []);

  const obtenerPagos = async () => {
    try {
      const res = await api.get("/pagos/");
      setPagos(res.data);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error al cargar pagos",
        text: error.response?.data?.detail || "No se pudieron obtener los pagos",
      });
    }
  };

  const pagosFiltrados = pagos.filter((p) =>
    `${p.id_pago} ${p.monto} ${p.estado}`.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <Container fluid className="p-4">
      <Card className="shadow-sm border-0">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Card.Title className="mb-0">
              <i className="fas fa-credit-card me-2 text-success"></i>
              Pagos Realizados
            </Card.Title>
          </div>

          <InputGroup className="mb-3">
            <InputGroup.Text><i className="fas fa-search"></i></InputGroup.Text>
            <Form.Control
              placeholder="Buscar por ID, monto o estado..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
          </InputGroup>

          <div className="table-responsive">
            <Table hover>
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Monto</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pagosFiltrados.map((p) => (
                  <tr key={p.id_pago}>
                    <td>#{String(p.id_pago).padStart(3, "0")}</td>
                    <td>${parseFloat(p.monto).toLocaleString("es-CO")}</td>
                    <td>{new Date(p.fecha_pago).toLocaleDateString()}</td>
                    <td>
                      <Badge bg={
                        p.estado === "Completado" ? "success" :
                        p.estado === "Pendiente" ? "warning" :
                        "danger"
                      }>
                        {p.estado}
                      </Badge>
                    </td>
                    <td>
                      <Button size="sm" variant="info">
                        <i className="fas fa-eye"></i>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Pagos;
