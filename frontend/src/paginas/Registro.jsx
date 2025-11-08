import { useState } from "react";
import { Container, Row, Col, Form, Spinner, Button, ProgressBar } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import api from "../api/axiosConfig";
import "boxicons/css/boxicons.min.css";
import "../assets/estilos/registro.css";
import Logo from "../assets/img/Logo-Serv.png";

export default function Registro() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [registroExitoso, setRegistroExitoso] = useState(false); // 👈 nuevo estado para mostrar pantalla de éxito

  // Datos del formulario
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
      const response = await api.post("/usuarios/registro", {
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

      if (response.status === 201 || response.status === 200) {
        // Mostrar pantalla de éxito
        setRegistroExitoso(true);

        // Redirigir automáticamente en 3 segundos
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    } catch (err) {
      console.error("Error en registro:", err);
      const mensajeError = err.response?.data?.detail || "Verifica los datos o si el usuario ya existe";
      Swal.fire({
        icon: "error",
        title: "Error en el registro",
        text: `${mensajeError} ❌`,
        confirmButtonColor: "#dc3545",
      });
    } finally {
      setLoading(false);
    }
  };

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

  // 🎉 Pantalla de éxito (aparece después de registrarse)
  if (registroExitoso) {
    return (
      <div className="registro-page">
        <div className="registro-container">
          <div className="registro-background">
            <div className="registro-shape registro-shape-1"></div>
            <div className="registro-shape registro-shape-2"></div>
            <div className="registro-shape registro-shape-3"></div>
            <div className="registro-shape registro-shape-4"></div>
          </div>

          <Container className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="p-5 mt-5 bg-white rounded-4 shadow-lg"
            >
              <i className="bx bx-check-circle text-success" style={{ fontSize: "5rem" }}></i>
              <h2 className="mt-3 text-success">¡Registro completado con éxito!</h2>
              <p className="text-muted">
                Bienvenido <strong>{usuario}</strong> 🎉 <br />
                Serás redirigido al inicio de sesión en unos segundos...
              </p>
              <Spinner animation="border" variant="success" className="mt-3" />
            </motion.div>
          </Container>
        </div>
      </div>
    );
  }

  // 🧩 Formulario de registro (2 pasos)
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
                    <Link to="/">
                      <img src={Logo} alt="Servilavadora" className="logo-imgen" />
                    </Link>
                  </div>
                  <h2>Crear Cuenta </h2>
                  <p className="text-muted">Únete a nuestra comunidad</p>
                </div>

               

                <Form onSubmit={handleSubmit}>
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
                        <Row className="mb-3">
                          <Col xs={12}>
                            <div className="input-box-login animation-login">

                              <label>Usuario</label>
                              <i className="bx bxs-user"></i>
                              <Form.Control
                                type="text"
                                value={usuario}
                                onChange={(e) => setUsuario(e.target.value)}
                                required
                                placeholder=" "
                              />
                              
                            </div>
                          </Col>
                        </Row>

                        <Row className="mb-3">
                          <Col md={6} className="mb-3 mb-md-0">
                            <div className="input-box-login animation-login">
                              <label>Nombres</label>
                              <i className="bx bxs-id-card"></i>
                              <Form.Control
                                type="text"
                                name="nombres"
                                value={persona.nombres}
                                onChange={handleChangePersona}
                                required
                                placeholder=" "
                              />
                              
                            </div>
                          </Col>
                          <Col md={6}>
                            <div className="input-box-login animation-login">
                              <label>Apellidos</label>
                              <i className="bx bxs-user-detail"></i>
                              <Form.Control
                                type="text"
                                name="apellidos"
                                value={persona.apellidos}
                                onChange={handleChangePersona}
                                required
                                placeholder=" "
                              />
                              
                            </div>
                          </Col>
                        </Row>

                        <Row className="mb-4">
                          <Col md={6} className="mb-3 mb-md-0">
                            <div className="input-box-login animation-login">
                               <label>Correo Electrónico</label>
                              <i className="bx bx-envelope"></i>
                              <Form.Control
                                type="email"
                                name="correo"
                                value={persona.correo}
                                onChange={handleChangePersona}
                                required
                                placeholder=" "
                              />
                             
                            </div>
                          </Col>
                          <Col md={6}>
                            <div className="input-box-login animation-login">
                              <label>Teléfono (Opcional)</label>
                              <i className="bx bx-phone"></i>
                              <Form.Control
                                type="text"
                                name="telefono"
                                value={persona.telefono}
                                onChange={handleChangePersona}
                                placeholder=" "
                              />
                              
                            </div>
                          </Col>
                        </Row>

                        <Button variant="primary" className="btn-login w-100" onClick={handleNext}>
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
                        <div className="input-box-login animation-login mb-4">
                          <Form.Control
                            type="password"
                            value={contrasena}
                            onChange={(e) => setContrasena(e.target.value)}
                            required
                            placeholder=" "
                            minLength={6}
                          />
                          <label>Contraseña (mínimo 6 caracteres)</label>
                          <i className="bx bxs-lock-alt"></i>
                        </div>

                        <div className="input-box-login animation-login mb-4">
                          <Form.Control
                            type="password"
                            value={confirmar}
                            onChange={(e) => setConfirmar(e.target.value)}
                            required
                            placeholder=" "
                            minLength={6}
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

                <div className="registro-footer text-center mt-4">
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
