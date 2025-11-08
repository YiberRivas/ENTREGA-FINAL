import React, { useState } from "react";
import { Card, Table, Button, Form, Row, Col } from "react-bootstrap";

/*
 Props:
  - data: array de agendamientos
  - onView, onEdit, onDelete: funciones
*/
const AgendamientosTable = ({ data = [], onView, onEdit, onDelete }) => {
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 5;

  // 🔹 Filtrar por cliente, servicio o estado
  const filtered = data.filter(d =>
    [d.cliente, d.servicio, d.estado].join(" ").toLowerCase().includes(filter.toLowerCase())
  );

  // 🔹 Paginación
  const start = (currentPage - 1) * perPage;
  const pageData = filtered.slice(start, start + perPage);
  const totalPages = Math.ceil(filtered.length / perPage) || 1;

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <Card.Title>Agendamientos Recientes</Card.Title>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Control
              placeholder="Filtrar por cliente / servicio / estado"
              value={filter}
              onChange={e => {
                setFilter(e.target.value);
                setCurrentPage(1);
              }}
            />
          </Col>
          <Col md={6} className="d-flex justify-content-end align-items-center">
            <small className="text-muted">
              Mostrando {start + 1} - {Math.min(start + perPage, filtered.length)} de {filtered.length}
            </small>
          </Col>
        </Row>

        <Table responsive hover>
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Servicio</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center">
                  No hay registros
                </td>
              </tr>
            ) : (
              pageData.map((row) => (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  <td>{row.cliente}</td>
                  <td>{row.servicio}</td>
                  <td>{row.fecha}</td>
                  <td>
                    <span
                      className={`badge ${
                        row.estado === "Confirmado"
                          ? "bg-success"
                          : row.estado === "Cancelado"
                          ? "bg-danger"
                          : "bg-warning text-dark"
                      }`}
                    >
                      {row.estado}
                    </span>
                  </td>
                  <td>
                    <Button variant="info" size="sm" className="me-1" onClick={() => onView(row)}>
                      <i className="fas fa-eye"></i>
                    </Button>
                    <Button variant="warning" size="sm" className="me-1" onClick={() => onEdit(row)}>
                      <i className="fas fa-edit"></i>
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => onDelete(row)}>
                      <i className="fas fa-trash"></i>
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>

        {/* 🔹 Controles de paginación */}
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <Button
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Anterior
            </Button>
            <Button
              size="sm"
              className="ms-2"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Siguiente
            </Button>
          </div>
          <div>
            <small className="text-muted">
              Página {currentPage} / {totalPages}
            </small>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default AgendamientosTable;
