// paginas/Registro.jsx
import { useState } from "react";
<<<<<<< HEAD
import { Container, Row, Col, Form, Spinner, Button, ProgressBar } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import api from "../api/axiosConfig";
import "boxicons/css/boxicons.min.css";
import "../assets/estilos/registro.css";
import Logo from "../assets/Logo-Serv.png";

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
=======
import { Container, Row, Col, Form, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import "../assets/estilos/registro.css";
import Logo from "../assets/img/Logo-Serv.png";

export default function Registro() {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
>>>>>>> 99875aa0c7e4d1ba439d7cb0423cfe923082821c
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

<<<<<<< HEAD
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

  // Capturar el mensaje de error correctamente
  let mensajeError = "Verifica los datos o si el usuario ya existe";

  if (err.response) {
    if (typeof err.response.data === "string") {
      mensajeError = err.response.data;
    } else if (err.response.data?.detail) {
      if (typeof err.response.data.detail === "string") {
        mensajeError = err.response.data.detail;
      } else if (Array.isArray(err.response.data.detail)) {
        mensajeError = err.response.data.detail.map(d => d.msg || JSON.stringify(d)).join(", ");
      } else if (typeof err.response.data.detail === "object") {
        mensajeError = JSON.stringify(err.response.data.detail);
      }
    }
  }

  Swal.fire({
    icon: "error",
    title: "Error en el registro",
    html: `<strong>${mensajeError}</strong> ❌`,
    confirmButtonColor: "#dc3545",
  });

    } finally {
      setLoading(false);
=======
    if (formData.contraseña !== formData.confirmarContraseña) {
      showAlert("Las contraseñas no coinciden", "error");
      return;
>>>>>>> 99875aa0c7e4d1ba439d7cb0423cfe923082821c
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

<<<<<<< HEAD
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
=======
  return (
    <div className="registro-page">
      
>>>>>>> 99875aa0c7e4d1ba439d7cb0423cfe923082821c
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
<<<<<<< HEAD
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
=======
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
>>>>>>> 99875aa0c7e4d1ba439d7cb0423cfe923082821c
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