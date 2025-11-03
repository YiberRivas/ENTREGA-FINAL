// paginas/Login.jsx
import { useState } from "react";
import { Container, Row, Col, Form, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import "../assets/estilos/login.css";
import Logo from "../assets/img/Logo-Serv.png";

export default function Login() {
  const [formData, setFormData] = useState({
    usuario: "",
    contraseña: ""
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
    
    // Validaciones básicas
    if (!formData.usuario || !formData.contraseña) {
      showAlert("Por favor completa todos los campos", "error");
      return;
    }

    if (formData.contraseña.length < 6) {
      showAlert("La contraseña debe tener al menos 6 caracteres", "error");
      return;
    }

    // Simulación de login exitoso
    showAlert("¡Inicio de sesión exitoso! Redirigiendo...", "success");
    
    // Guardar token simulado
    localStorage.setItem("token", "token_simulado");
    
    // Redirigir después de 2 segundos
    setTimeout(() => {
      navigate("/");
    }, 2000);
  };

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => {
      setAlert({ show: false, message: "", type: "" });
    }, 5000);
  };

  return (
    <div className="login-page">
      
      <div className="login-container">
        {/* Fondos animados */}
        <div className="login-background">
          <div className="floating-shape shape-1"></div>
          <div className="floating-shape shape-2"></div>
          <div className="floating-shape shape-3"></div>
          <div className="floating-shape shape-4"></div>
        </div>

        <Container>
          <Row className="justify-content-center">
            <Col md={6} lg={4}>
              <div className="login-card p-4">
                <div className="login-header">
                  <div className="login-logo">
                    <Link to="/">
                      <img src={Logo} alt="Servilavadora" className="logo-imagenn" />
                    </Link>
                  </div>
                  <h2>Iniciar Sesión</h2>
                  <p className="text-muted">Accede a tu cuenta</p>
                </div>

                {alert.show && (
                  <Alert 
                    className={alert.type === "success" ? "alert-custom alert-success-custom" : "alert-custom alert-error-custom"}
                  >
                    {alert.message}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label className="form-label">Usuario o Email</label>
                    <Form.Control
                      type="text"
                      name="usuario"
                      value={formData.usuario}
                      onChange={handleChange}
                      placeholder="Ingresa tu usuario o email"
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Contraseña</label>
                    <Form.Control
                      type="password"
                      name="contraseña"
                      value={formData.contraseña}
                      onChange={handleChange}
                      placeholder="Ingresa tu contraseña"
                      className="form-control"
                    />
                  </div>

                  <button type="submit" className="btn-login">
                    Iniciar Sesión
                  </button>
                </Form>

                <div className="login-footer">
                  <p>
                    ¿No tienes una cuenta?{" "}
                    <Link to="/registro" className="login-link">
                      Regístrate aquí
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