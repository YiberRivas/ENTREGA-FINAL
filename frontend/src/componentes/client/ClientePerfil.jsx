import { useState, useEffect } from "react";
import { Card, Row, Col, Button, Form } from "react-bootstrap";
import Swal from "sweetalert2";

export default function ClientePerfil() {
  const [usuario, setUsuario] = useState(null);
  const [editando, setEditando] = useState(false);
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    correo: "",
    telefono: "",
  });

  useEffect(() => {
    const userData = localStorage.getItem("usuario");
    if (userData) {
      const user = JSON.parse(userData);
      setUsuario(user);
      setFormData({
        nombres: user.nombre?.split(" ")[0] || "",
        apellidos: user.nombre?.split(" ").slice(1).join(" ") || "",
        correo: user.correo || "",
        telefono: user.telefono || "",
      });
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí harías la petición al backend para actualizar
    Swal.fire({
      icon: "success",
      title: "Perfil actualizado",
      text: "Tus datos han sido actualizados correctamente",
      confirmButtonColor: "#28a745",
    });
    setEditando(false);
  };

  return (
    <div className="cliente-perfil">
      <h2 className="mb-4">
        <i className="bi bi-person-circle"></i> Mi Perfil
      </h2>

      <Row>
        <Col lg={8}>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Información Personal</h5>
            </Card.Header>
            <Card.Body>
              {!editando ? (
                <>
                  <Row className="mb-3">
                    <Col md={6}>
                      <strong>Nombre de usuario:</strong>
                      <p>{usuario?.usuario}</p>
                    </Col>
                    <Col md={6}>
                      <strong>Nombre completo:</strong>
                      <p>{usuario?.nombre}</p>
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Col md={6}>
                      <strong>Correo electrónico:</strong>
                      <p>{usuario?.correo || "No registrado"}</p>
                    </Col>
                    <Col md={6}>
                      <strong>Rol:</strong>
                      <p className="text-capitalize">{usuario?.rol}</p>
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Col md={6}>
                      <strong>Estado:</strong>
                      <p>
                        <span className={`badge ${usuario?.activo ? "bg-success" : "bg-danger"}`}>
                          {usuario?.activo ? "Activo" : "Inactivo"}
                        </span>
                      </p>
                    </Col>
                  </Row>
                  <Button variant="primary" onClick={() => setEditando(true)}>
                    <i className="bi bi-pencil"></i> Editar Perfil
                  </Button>
                </>
              ) : (
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Nombres</Form.Label>
                        <Form.Control
                          type="text"
                          name="nombres"
                          value={formData.nombres}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Apellidos</Form.Label>
                        <Form.Control
                          type="text"
                          name="apellidos"
                          value={formData.apellidos}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Correo electrónico</Form.Label>
                        <Form.Control
                          type="email"
                          name="correo"
                          value={formData.correo}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Teléfono</Form.Label>
                        <Form.Control
                          type="tel"
                          name="telefono"
                          value={formData.telefono}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <div className="d-flex gap-2">
                    <Button variant="success" type="submit">
                      <i className="bi bi-check-circle"></i> Guardar Cambios
                    </Button>
                    <Button variant="secondary" onClick={() => setEditando(false)}>
                      <i className="bi bi-x-circle"></i> Cancelar
                    </Button>
                  </div>
                </Form>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="shadow-sm mb-3">
            <Card.Header className="bg-info text-white">
              <h6 className="mb-0">Resumen de Cuenta</h6>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <small className="text-muted">Servicios contratados</small>
                <h3 className="mb-0">0</h3>
              </div>
              <div className="mb-3">
                <small className="text-muted">Agendamientos activos</small>
                <h3 className="mb-0">0</h3>
              </div>
              <div>
                <small className="text-muted">Última actividad</small>
                <p className="mb-0">Hoy</p>
              </div>
            </Card.Body>
          </Card>

          <Card className="shadow-sm">
            <Card.Header className="bg-warning text-dark">
              <h6 className="mb-0">Notificaciones</h6>
            </Card.Header>
            <Card.Body>
              <p className="text-muted mb-0">
                <i className="bi bi-info-circle"></i> No tienes notificaciones nuevas
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}