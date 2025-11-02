import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Spinner } from "react-bootstrap";
import api from "../api/axiosConfig";
import Swal from "sweetalert2";
import "boxicons/css/boxicons.min.css";
import "../assets/estilos/login.css";

export default function Login() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!usuario || !contrasena) {
      Swal.fire({
        icon: "warning",
        title: "Campos vacíos",
        text: "Por favor completa ambos campos antes de continuar ⚠️",
        confirmButtonColor: "#f39c12",
      });
      setLoading(false);
      return;
    }

    try {
      // Petición al backend
      const response = await api.post("/login", {
        usuario: usuario,
        contrasena: contrasena,
      });

      // Guardamos el token
      const token = response.data.access_token;
      localStorage.setItem("token", token);
      localStorage.setItem("usuario", usuario);

      // ✅ Alerta de éxito
      Swal.fire({
        icon: "success",
        title: "¡Bienvenido!",
        text: `Inicio de sesión exitoso. Hola, ${usuario} 👋`,
        confirmButtonColor: "#28a745",
        timer: 2000,
        timerProgressBar: true,
      }).then(() => {
        navigate("/inicio");
      });
    } catch (err) {
      console.error(err);
      // ❌ Alerta de error
      Swal.fire({
        icon: "error",
        title: "Error de autenticación",
        text: "Usuario o contraseña incorrectos ❌",
        confirmButtonColor: "#dc3545",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Botón volver */}
      <div className="top-left-button" onClick={() => navigate("/")}>
        <i className="bx bx-arrow-back"></i> Volver al inicio
      </div>

      <div className="floating-icons-login">
        <div></div><div></div><div></div><div></div>
      </div>

      <div className="login-container">
        <div className="curved-shape-login"></div>

        <div className="form-box-login">
          <h2 className="animation-login" style={{ "--D": 0 }}>Iniciar Sesión</h2>

          <Form onSubmit={handleSubmit}>
            <div className="input-box-login animation-login" style={{ "--D": 2 }}>
              <Form.Control
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                required
                placeholder=" "
              />
              <label>Usuario</label>
              <i className="bx bxs-user"></i>
            </div>

            <div className="input-box-login animation-login" style={{ "--D": 3 }}>
              <Form.Control
                type="password"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
                placeholder=" "
              />
              <label>Contraseña</label>
              <i className="bx bxs-lock-alt"></i>
            </div>

            <div className="input-box-login animation-login" style={{ "--D": 4 }}>
              <Button type="submit" className="btn-login" disabled={loading}>
                {loading ? <Spinner animation="border" size="sm" /> : <span>Ingresar</span>}
              </Button>
            </div>

            <div className="regi-link-login animation-login" style={{ "--D": 5 }}>
              <p>
                ¿No tienes una cuenta? <br />
                <span className="link-action-login" onClick={() => navigate("/registro")}>
                  Regístrate
                </span>
              </p>
            </div>
          </Form>
        </div>

        <div className="info-content-login">
          <h2 className="animation-login" style={{ "--D": 0 }}>¡Bienvenido de nuevo!</h2>
          <p className="animation-login" style={{ "--D": 1 }}>
            Accede a tu cuenta para gestionar tus lavadoras y servicios de alquiler fácilmente.
          </p>
        </div>
      </div>
    </div>
  );
}
