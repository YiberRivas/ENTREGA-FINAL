import { useState } from "react";
import { Container, Row, Col, Form, Alert, Spinner } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../api/axiosConfig";
import "../assets/estilos/login.css";
import Logo from "../assets/img/Logo-Serv.png";

export default function Login() {
  const [formData, setFormData] = useState({
    usuario: "",
    contrasena: ""
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const navigate = useNavigate();

  // 🔹 Manejar cambios en los inputs
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

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
      showAlert("Por favor completa todos los campos", "error");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/autenticacion/login", { 
        usuario: usuario, 
        contrasena: contrasena 
      });
      
      // ✅ Guardar token y datos del usuario
      const { access_token, usuario: userData } = response.data;
      localStorage.setItem("token", access_token);
      localStorage.setItem("usuario", JSON.stringify(userData));

      console.log("🔎 Rol recibido del backend:", userData.rol);

      // ✅ Normalizamos el rol para evitar errores de mayúsculas
      const rol = (userData.rol || "").toLowerCase().trim();

      console.log("✅ Rol normalizado:", rol);

      // ✅ Mostrar mensaje de éxito y redirigir
      await Swal.fire({
        icon: "success",
        title: "Inicio de sesión exitoso",
        text: `Bienvenido, ${userData.nombre} 👋`,
        confirmButtonColor: "#28a745",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false
      });

      // ✅ Redirección robusta según el rol (después del modal)
      if (rol === "administrador" || rol.includes("admin")) {
        console.log("➡️ Redirigiendo a: /admin/inicio");
        navigate("/admin/inicio", { replace: true });
      } else if (rol === "cliente" || rol.includes("cliente")) {
        console.log("➡️ Redirigiendo a: /cliente/perfil");
        navigate("/cliente/perfil", { replace: true });
      } else {
        console.log("⚠️ Rol no reconocido, redirigiendo a inicio");
        navigate("/", { replace: true });
      }

    } catch (err) {
      console.error("❌ Error de login:", err);

      let errorMessage = "Ocurrió un error inesperado al iniciar sesión.";
      if (err.response && err.response.data && err.response.data.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.code === "ERR_NETWORK") {
        errorMessage = "Error de conexión. El servidor puede estar inactivo.";
      }

      Swal.fire({
        icon: "error",
        title: "Error de autenticación",
        text: `${errorMessage} ❌`,
        confirmButtonColor: "#dc3545",
      });

    } finally {
      setLoading(false);
    }
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
                <div className="login-header text-center">
                  <Link to="/">
                    <img src={Logo} alt="Servilavadora" className="logo-imagenn mb-3" />
                  </Link>
                  <h2>Iniciar Sesión</h2>
                  <p className="text-muted">Accede a tu cuenta</p>
                </div>

                {alert.show && (
                  <Alert
                    className={
                      alert.type === "success"
                        ? "alert-custom alert-success-custom"
                        : "alert-custom alert-error-custom"
                    }
                  >
                    {alert.message}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <div className="form-group mb-3">
                    <label className="form-label">Usuario</label>
                    <Form.Control
                      type="text"
                      name="usuario"
                      value={formData.usuario}
                      onChange={handleChange}
                      placeholder="Ingresa tu usuario"
                      className="form-control"
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