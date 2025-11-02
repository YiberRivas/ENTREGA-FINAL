import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Spinner, ProgressBar } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import "boxicons/css/boxicons.min.css";
import "../assets/estilos/login.css";

export default function Registro() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [persona, setPersona] = useState({
    nombres: "",
    apellidos: "",
    correo: "",
    telefono: "",
  });

  const handleChangePersona = (e) => {
    setPersona({ ...persona, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (!usuario || !persona.nombres || !persona.apellidos || !persona.correo) {
      setError("Completa todos los campos antes de continuar ⚠️");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleBack = () => setStep(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setExito("");

    if (contrasena !== confirmar) {
      setError("Las contraseñas no coinciden ❌");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("http://127.0.0.1:8080/usuarios/registro", {
        usuario,
        contrasena,
        persona: {
          ...persona,
          tipo_identificacion_id: 1,
          direccion_id: null,
          rol_id: 1,
          fecha_registro: new Date().toISOString().split("T")[0],
        },
      });

      if (response.status === 200) {
        setExito(`Usuario "${usuario}" registrado correctamente ✅`);
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err) {
      setError("Error al registrar. Verifica los datos o si el usuario ya existe ❌");
    } finally {
      setLoading(false);
    }
  };

  // Animaciones de entrada/salida
  const slideVariants = {
    initial: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      position: "absolute",
    }),
    animate: {
      x: 0,
      opacity: 1,
      position: "relative",
      transition: { duration: 0.5, ease: "easeOut" },
    },
    exit: (direction) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
      position: "absolute",
      transition: { duration: 0.5, ease: "easeIn" },
    }),
  };

  return (
    <div className="login-page">
      <div className="top-left-button" onClick={() => navigate("/login")}>
        <i className="bx bx-arrow-back"></i> Volver al Login
      </div>

      <div className="login-container">
        <div className="curved-shape-login"></div>

        <div className="form-box-login">
          <h2 className="animation-login" style={{ "--D": 0 }}>
            Crear Cuenta ({step}/2)
          </h2>

          <ProgressBar
            now={step === 1 ? 50 : 100}
            label={step === 1 ? "Datos personales" : "Credenciales"}
            className="mb-3"
          />

          {error && (
            <div className="alert-error-login visible animation-login" style={{ "--D": 1 }}>
              <i className="bx bxs-error"></i>
              <span>{error}</span>
            </div>
          )}
          {exito && (
            <div className="alert-success-login visible animation-login" style={{ "--D": 1 }}>
              <i className="bx bxs-check-circle"></i>
              <span>{exito}</span>
            </div>
          )}

          <Form onSubmit={handleSubmit} style={{ position: "relative", overflow: "hidden", minHeight: "320px" }}>
            <AnimatePresence custom={step}>
              {step === 1 && (
                <motion.div
                  key="step1"
                  variants={slideVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  custom={step}
                >
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
                      type="text"
                      name="nombres"
                      value={persona.nombres}
                      onChange={handleChangePersona}
                      required
                      placeholder=" "
                    />
                    <label>Nombres</label>
                    <i className="bx bxs-id-card"></i>
                  </div>

                  <div className="input-box-login animation-login" style={{ "--D": 4 }}>
                    <Form.Control
                      type="text"
                      name="apellidos"
                      value={persona.apellidos}
                      onChange={handleChangePersona}
                      required
                      placeholder=" "
                    />
                    <label>Apellidos</label>
                    <i className="bx bxs-user-detail"></i>
                  </div>

                  <div className="input-box-login animation-login" style={{ "--D": 5 }}>
                    <Form.Control
                      type="email"
                      name="correo"
                      value={persona.correo}
                      onChange={handleChangePersona}
                      required
                      placeholder=" "
                    />
                    <label>Correo Electrónico</label>
                    <i className="bx bx-envelope"></i>
                  </div>

                  <div className="input-box-login animation-login" style={{ "--D": 6 }}>
                    <Form.Control
                      type="text"
                      name="telefono"
                      value={persona.telefono}
                      onChange={handleChangePersona}
                      placeholder=" "
                    />
                    <label>Teléfono</label>
                    <i className="bx bx-phone"></i>
                  </div>

                  <Button variant="primary" className="btn-login mt-3 w-100" onClick={handleNext}>
                    Siguiente ➜
                  </Button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  variants={slideVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  custom={step}
                >
                  <div className="input-box-login animation-login" style={{ "--D": 7 }}>
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

                  <div className="input-box-login animation-login" style={{ "--D": 8 }}>
                    <Form.Control
                      type="password"
                      value={confirmar}
                      onChange={(e) => setConfirmar(e.target.value)}
                      required
                      placeholder=" "
                    />
                    <label>Confirmar Contraseña</label>
                    <i className="bx bxs-lock"></i>
                  </div>

                  <div className="d-flex justify-content-between mt-4">
                    <Button variant="secondary" onClick={handleBack}>
                      ← Atrás
                    </Button>
                    <Button type="submit" className="btn-login" disabled={loading}>
                      {loading ? <Spinner animation="border" size="sm" /> : "Registrarse"}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Form>
        </div>

        <div className="info-content-login">
          <h2 className="animation-login" style={{ "--D": 0 }}>
            ¡ÚNETE A SERVILAVADORA!
          </h2>
          <p className="animation-login" style={{ "--D": 1 }}>
            Crea tu cuenta en dos pasos para disfrutar de nuestros servicios de lavado de forma fácil y rápida.
          </p>
        </div>
      </div>
    </div>
  );
}
