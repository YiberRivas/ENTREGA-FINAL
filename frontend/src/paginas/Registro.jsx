// paginas/Registro.jsx
import { useState } from "react";
import { Container, Row, Col, Form, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import "../assets/estilos/registro.css";
import Logo from "../assets/img/Logo-Serv.png";

export default function Registro() {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    contraseña: "",
    confirmarContraseña: ""
  });
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.nombre || !formData.apellido || !formData.email || !formData.contraseña) {
      showAlert("Por favor completa todos los campos obligatorios", "error");
      return;
    }

    if (formData.contraseña !== formData.confirmarContraseña) {
      showAlert("Las contraseñas no coinciden", "error");
      return;
    }

    if (formData.contraseña.length < 6) {
      showAlert("La contraseña debe tener al menos 6 caracteres", "error");
      return;
    }
    
    // Redirigir después de 2 segundos
    setTimeout(() => {
      navigate("/login");
    }, 2000);
  };

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => {
      setAlert({ show: false, message: "", type: "" });
    }, 5000);
  };

  return (
    <div className="registro-page">
      
      <div className="registro-container">
        {/* Fondos animados */}
        <div className="registro-background">
          <div className="registro-shape registro-shape-1"></div>
          <div className="registro-shape registro-shape-2"></div>
          <div className="registro-shape registro-shape-3"></div>
          <div className="registro-shape registro-shape-4"></div>
        </div>

        <Container>
          <Row className="justify-content-center">
            <Col md={8} lg={6}>
              <div className="registro-card p-4">
                <div className="registro-header">
                  <div className="registro-logo">
                    <div className="registro-logo-image">
                      <Link to="/">
                        <img src={Logo} alt="Servilavadora" className="logo-imgen" />
                      </Link>
                    </div>
                  </div>
                  <h2>Crear Cuenta</h2>
                  <p className="text-muted">Únete a nuestra comunidad</p>
                </div>

                {alert.show && (
                  <Alert 
                    className={alert.type === "success" ? "alert-custom alert-success-custom" : "alert-custom alert-error-custom"}
                  >
                    {alert.message}
                  </Alert>
                )}


                <Form onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Nombre</label>
                      <Form.Control
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        placeholder="Tu nombre"
                        className="form-control"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Apellido</label>
                      <Form.Control
                        type="text"
                        name="apellido"
                        value={formData.apellido}
                        onChange={handleChange}
                        placeholder="Tu apellido"
                        className="form-control"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="tu@email.com"
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Teléfono (Opcional)</label>
                    <Form.Control
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      placeholder="+57 300 000 0000"
                      className="form-control"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Contraseña</label>
                      <Form.Control
                        type="password"
                        name="contraseña"
                        value={formData.contraseña}
                        onChange={handleChange}
                        placeholder="Mínimo 6 caracteres"
                        className="form-control"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Confirmar Contraseña</label>
                      <Form.Control
                        type="password"
                        name="confirmarContraseña"
                        value={formData.confirmarContraseña}
                        onChange={handleChange}
                        placeholder="Repite tu contraseña"
                        className="form-control"
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn-registro">
                    Crear Cuenta
                  </button>
                </Form>

                <div className="registro-footer">
                  <p>
                    ¿Ya tienes una cuenta?{" "}
                    <Link to="/login" className="registro-link">
                      Inicia sesión aquí
                    </Link>
                  </p>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
}