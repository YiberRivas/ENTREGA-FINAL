import React from "react";
import { Row, Col, Card } from "react-bootstrap";

const StatsCards = ({ stats }) => {
  const cards = [
    { icon: "users", title: "Usuarios Registrados", value: stats.usuarios },
    { icon: "cogs", title: "Lavadoras Activas", value: stats.lavadoras },
    { icon: "calendar-check", title: "Agendamientos", value: stats.agendamientos },
    { icon: "dollar-sign", title: "Pagos Completados", value: stats.pagos },
  ];

  return (
    <Row className="g-3">
      {cards.map((c, i) => (
        <Col key={i} xs={12} md={6} lg={3}>
          <Card className="shadow-sm h-100">
            <Card.Body className="text-center">
              <i className={`fas fa-${c.icon} fs-2 text-info mb-2`}></i>
              <Card.Title className="fs-6">{c.title}</Card.Title>
              <Card.Text className="fs-4 fw-bold">{c.value}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default StatsCards;
