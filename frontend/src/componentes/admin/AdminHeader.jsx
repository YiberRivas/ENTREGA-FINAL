import React from "react";
import { Row, Col, Form, InputGroup, Image } from "react-bootstrap";

/* Header con buscador y perfil */
const AdminHeader = () => {
  return (
    <Row className="align-items-center admin-header bg-white p-3 rounded shadow-sm">
      <Col md={6}>
        <InputGroup>
          <InputGroup.Text><i className="fas fa-search"></i></InputGroup.Text>
          <Form.Control placeholder="Buscar..." />
        </InputGroup>
      </Col>
      <Col md={6} className="d-flex justify-content-end align-items-center gap-3">
        <span className="fw-bold">Admin</span>
        <Image src="https://randomuser.me/api/portraits/men/75.jpg" roundedCircle width={40} height={40} style={{ border: '2px solid #00C6B3' }} />
      </Col>
    </Row>
  );
};

export default AdminHeader;
