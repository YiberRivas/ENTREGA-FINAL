import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Spinner } from "react-bootstrap";
import api from "../api/axiosConfig";
import "boxicons/css/boxicons.min.css";
import "../assets/estilos/login.css";

export default function Login() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

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

      // Redirigimos a la página principal
      navigate("/inicio");
    } catch (err) {
      console.error(err);
      setError("Usuario o contraseña incorrectos ❌");
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

          {error && (
            <div className="alert-error-login visible animation-login" style={{ "--D": 1 }}>
              <i className="bx bxs-error"></i>
              <span>{error}</span>
            </div>
          )}

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
