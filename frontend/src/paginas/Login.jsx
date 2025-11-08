// paginas/Login.jsx
import { useState } from "react";
<<<<<<< HEAD
import { Container, Row, Col, Form, Alert, Spinner } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../api/axiosConfig";
import "../assets/estilos/login.css";
import Logo from "../assets/Logo-Serv.png";
=======
import { Container, Row, Col, Form, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import "../assets/estilos/login.css";
import Logo from "../assets/img/Logo-Serv.png";
>>>>>>> 99875aa0c7e4d1ba439d7cb0423cfe923082821c

export default function Login() {
  const [formData, setFormData] = useState({
    usuario: "",
<<<<<<< HEAD
    contrasena: ""
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const navigate = useNavigate();

  // 🔹 Manejar cambios en los inputs
=======
    contraseña: ""
  });
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const navigate = useNavigate();

>>>>>>> 99875aa0c7e4d1ba439d7cb0423cfe923082821c
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

<<<<<<< HEAD
  // 🔹 Mostrar alerta temporal
  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => {
      setAlert({ show: false, message: "", type: "" });
    }, 4000);
  };

  // 🔹 Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { usuario, contrasena } = formData;

    if (!usuario || !contrasena) {
=======
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.usuario || !formData.contraseña) {
>>>>>>> 99875aa0c7e4d1ba439d7cb0423cfe923082821c
      showAlert("Por favor completa todos los campos", "error");
      return;
    }

<<<<<<< HEAD
    setLoading(true);

    try {
      // Petición al backend FastAPI
      const response = await api.post("/login", {
        usuario: usuario,
        contrasena: contrasena
      });

      // ✅ Guardar token
      const token = response.data.access_token;
      localStorage.setItem("token", token);
      localStorage.setItem("usuario", usuario);

      // ✅ Mostrar éxito
      Swal.fire({
        icon: "success",
        title: "Inicio de sesión exitoso",
        text: `Bienvenido, ${usuario} 👋`,
        confirmButtonColor: "#28a745",
        timer: 2000,
        timerProgressBar: true,
      }).then(() => {
        navigate("/admin/inicio"); // Ruta después del login
      });
    } catch (err) {
      console.error("Error de login:", err);
      Swal.fire({
        icon: "error",
        title: "Error de autenticación",
        text: "Usuario o contraseña incorrectos ❌",
        confirmButtonColor: "#dc3545",
      });
    } finally {
      setLoading(false);
=======
    if (formData.contraseña.length < 6) {
      showAlert("La contraseña debe tener al menos 6 caracteres", "error");
      return;
>>>>>>> 99875aa0c7e4d1ba439d7cb0423cfe923082821c
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
<<<<<<< HEAD
=======
      
>>>>>>> 99875aa0c7e4d1ba439d7cb0423cfe923082821c
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
<<<<<<< HEAD
                <div className="login-header text-center">
                  <Link to="/">
                    <img src={Logo} alt="Servilavadora" className="logo-imagenn mb-3" />
                  </Link>
=======
                <div className="login-header">
                  <div className="login-logo">
                    <Link to="/">
                      <img src={Logo} alt="Servilavadora" className="logo-imagenn" />
                    </Link>
                  </div>
>>>>>>> 99875aa0c7e4d1ba439d7cb0423cfe923082821c
                  <h2>Iniciar Sesión</h2>
                  <p className="text-muted">Accede a tu cuenta</p>
                </div>

                {alert.show && (
<<<<<<< HEAD
                  <Alert
                    className={
                      alert.type === "success"
                        ? "alert-custom alert-success-custom"
                        : "alert-custom alert-error-custom"
                    }
=======
                  <Alert 
                    className={alert.type === "success" ? "alert-custom alert-success-custom" : "alert-custom alert-error-custom"}
>>>>>>> 99875aa0c7e4d1ba439d7cb0423cfe923082821c
                  >
                    {alert.message}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
<<<<<<< HEAD
                  <div className="form-group mb-3">
=======
                  <div className="form-group">
>>>>>>> 99875aa0c7e4d1ba439d7cb0423cfe923082821c
                    <label className="form-label">Usuario o Email</label>
                    <Form.Control
                      type="text"
                      name="usuario"
                      value={formData.usuario}
                      onChange={handleChange}
                      placeholder="Ingresa tu usuario o email"
                      className="form-control"
<<<<<<< HEAD
                      required
                    />
                  </div>

                  <div className="form-group mb-3">
                    <label className="form-label">Contraseña</label>
                    <Form.Control
                      type="password"
                      name="contrasena"
                      value={formData.contrasena}
                      onChange={handleChange}
                      placeholder="Ingresa tu contraseña"
                      className="form-control"
                      required
                    />
                  </div>

                  <button type="submit" className="btn-login" disabled={loading}>
                    {loading ? <Spinner animation="border" size="sm" /> : "Iniciar Sesión"}
                  </button>
                </Form>

                <div className="login-footer mt-3 text-center">
=======
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
>>>>>>> 99875aa0c7e4d1ba439d7cb0423cfe923082821c
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