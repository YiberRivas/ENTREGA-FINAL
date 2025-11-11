import { useState } from "react";
import { Modal, Form, Button, Spinner, Row, Col } from "react-bootstrap";
import Swal from "sweetalert2";
import api from "../../api/axiosConfig";

export default function RegistroCliente({ show, onHide, onCreated }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [confirmar, setConfirmar] = useState("");

  const [persona, setPersona] = useState({
    nombres: "",
    apellidos: "",
    fecha_nacimiento: "",
    tipo_identificacion_id: "",
    identificacion: "",
    telefono: "",
    correo: "",
  });

  const handleChangePersona = (e) => {
    setPersona({ ...persona, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (
      !persona.nombres ||
      !persona.apellidos ||
      !persona.correo ||
      !persona.identificacion ||
      !persona.tipo_identificacion_id ||
      !persona.fecha_nacimiento
    ) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Completa todos los campos antes de continuar ⚠️",
        confirmButtonColor: "#f39c12",
      });
      return;
    }
    setStep(2);
  };

  const handleBack = () => setStep(1);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!usuario || !contrasena || !confirmar) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Completa todos los campos de usuario ⚠️",
        confirmButtonColor: "#f39c12",
      });
      return;
    }

    if (contrasena !== confirmar) {
      Swal.fire({
        icon: "error",
        title: "Contraseñas no coinciden",
        text: "Verifica que ambas contraseñas sean iguales ❌",
        confirmButtonColor: "#dc3545",
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        usuario: usuario,
        contrasena: contrasena,
        persona: {
          nombres: persona.nombres,
          apellidos: persona.apellidos,
          fecha_nacimiento: persona.fecha_nacimiento,
          tipo_identificacion_id: parseInt(persona.tipo_identificacion_id) || 1,
          identificacion: persona.identificacion,
          telefono: persona.telefono || "",
          correo: persona.correo,
          rol_id: 1,
          fecha_registro: new Date().toISOString().split("T")[0],
        },
      };

      console.log("📤 Enviando cliente:", payload);
      const response = await api.post("/usuarios/registro", payload);

      if (response.status === 201 || response.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Cliente registrado ✅",
          text: `Usuario "${usuario}" creado correctamente`,
          confirmButtonColor: "#28a745",
          timer: 2000,
          timerProgressBar: true,
        });

        // Si el backend devuelve la persona, la enviamos al padre
        onCreated?.(response.data);
        onHide();
      }
    } catch (err) {
      console.error("Error en registro:", err.response?.data || err);
      Swal.fire({
        icon: "error",
        title: "Error al registrar cliente",
        text: err.response?.data?.detail || "Verifica los datos o si el usuario ya existe ❌",
        confirmButtonColor: "#dc3545",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPersona({
      nombres: "",
      apellidos: "",
      fecha_nacimiento: "",
      tipo_identificacion_id: "",
      identificacion: "",
      telefono: "",
      correo: "",
    });
    setUsuario("");
    setContrasena("");
    setConfirmar("");
    setStep(1);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Registrar Cliente</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          {step === 1 && (
            <>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Nombres</Form.Label>
                    <Form.Control
                      type="text"
                      name="nombres"
                      value={persona.nombres}
                      onChange={handleChangePersona}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Apellidos</Form.Label>
                    <Form.Control
                      type="text"
                      name="apellidos"
                      value={persona.apellidos}
                      onChange={handleChangePersona}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Fecha de nacimiento</Form.Label>
                    <Form.Control
                      type="date"
                      name="fecha_nacimiento"
                      value={persona.fecha_nacimiento}
                      onChange={handleChangePersona}
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Tipo de identificación</Form.Label>
                    <Form.Select
                      name="tipo_identificacion_id"
                      value={persona.tipo_identificacion_id}
                      onChange={handleChangePersona}
                      required
                    >
                      <option value="">Seleccione...</option>
                      <option value="1">Cédula de Ciudadanía</option>
                      <option value="2">Tarjeta de Identidad</option>
                      <option value="3">Cédula Extranjera</option>
                      <option value="4">Pasaporte</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Identificación</Form.Label>
                    <Form.Control
                      type="text"
                      name="identificacion"
                      value={persona.identificacion}
                      onChange={handleChangePersona}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Teléfono</Form.Label>
                    <Form.Control
                      type="text"
                      name="telefono"
                      value={persona.telefono}
                      onChange={handleChangePersona}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Correo electrónico</Form.Label>
                <Form.Control
                  type="email"
                  name="correo"
                  value={persona.correo}
                  onChange={handleChangePersona}
                  required
                />
              </Form.Group>

              <div className="text-end">
                <Button variant="primary" onClick={handleNext}>
                  Siguiente ➜
                </Button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Usuario</Form.Label>
                <Form.Control
                  type="text"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Contraseña</Form.Label>
                <Form.Control
                  type="password"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  required
                  minLength={6}
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Confirmar contraseña</Form.Label>
                <Form.Control
                  type="password"
                  value={confirmar}
                  onChange={(e) => setConfirmar(e.target.value)}
                  required
                  minLength={6}
                />
              </Form.Group>

              <div className="d-flex justify-content-between">
                <Button variant="secondary" onClick={handleBack}>
                  ← Atrás
                </Button>
                <Button type="submit" variant="success" disabled={loading}>
                  {loading ? <Spinner animation="border" size="sm" /> : "Registrar Cliente"}
                </Button>
              </div>
            </>
          )}
        </Form>
      </Modal.Body>
    </Modal>
  );
}
