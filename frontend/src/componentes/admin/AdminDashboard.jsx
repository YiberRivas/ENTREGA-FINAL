import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Table, Form, InputGroup, Image, Spinner, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig";
import Swal from "sweetalert2";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import "../../assets/estilos/AdminDashboard.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [resumen, setResumen] = useState({ usuarios: 0, lavadoras_activas: 0, agendamientos: 0, pagos: 0 });
  const [agendamientos, setAgendamientos] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [serviciosPopulares, setServiciosPopulares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usuario, setUsuario] = useState("");
  const [filtro, setFiltro] = useState("");

  // 🎯 Colores para los gráficos
  const COLORS = ["#17a2b8", "#28a745", "#ffc107", "#dc3545", "#6610f2"];

  useEffect(() => {
    const nombreUsuario = localStorage.getItem("usuario");
    setUsuario(nombreUsuario || "Admin");
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resResumen, resAg, resEstadisticas, resPopulares] = await Promise.all([
        api.get("/admin/resumen"),
        api.get("/admin/agendamientos_recientes?limite=10"),
        api.get("/admin/estadisticas/mes"),
        api.get("/admin/servicios/populares"),
      ]);

      setResumen(resResumen.data);
      setAgendamientos(resAg.data);
      setEstadisticas(resEstadisticas.data);
      setServiciosPopulares(resPopulares.data);
    } catch (error) {
      console.error("Error al obtener datos:", error);
      Swal.fire({
        icon: "error",
        title: "Error al cargar datos",
        text: error.response?.data?.detail || "No se pudieron obtener los datos del dashboard",
      });
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadge = (estado) => {
    const estados = {
      pendiente: { bg: "warning", text: "Pendiente" },
      confirmado: { bg: "info", text: "Confirmado" },
      en_proceso: { bg: "primary", text: "En Proceso" },
      finalizado: { bg: "success", text: "Finalizado" },
      cancelado: { bg: "danger", text: "Cancelado" },
    };
    return estados[estado] || { bg: "secondary", text: estado };
  };

  const agendamientosFiltrados = agendamientos.filter((a) => {
    const busqueda = filtro.toLowerCase();
    return (
      a.cliente.toLowerCase().includes(busqueda) ||
      a.servicio.toLowerCase().includes(busqueda) ||
      a.estado.toLowerCase().includes(busqueda)
    );
  });

  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="info" style={{ width: "3rem", height: "3rem" }} />
        <p className="mt-3 text-muted">Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <Container fluid className="p-4" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      {/* Header */}
      <Row className="align-items-center bg-white shadow-sm rounded mb-4 p-3">
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text>
              <i className="fas fa-search"></i>
            </InputGroup.Text>
            <Form.Control 
              type="text" 
              placeholder="Buscar agendamientos..." 
              value={filtro} 
              onChange={(e) => setFiltro(e.target.value)} 
            />
          </InputGroup>
        </Col>
        <Col md={6} className="d-flex justify-content-end align-items-center gap-3">
          <span className="fw-bold">{usuario}</span>
          <Image 
            src="https://randomuser.me/api/portraits/men/75.jpg" 
            roundedCircle 
            width={40} 
            height={40} 
            style={{ border: "2px solid #17a2b8" }}
          />
        </Col>
      </Row>

      {/* Resumen */}
      <Row className="g-3 mb-4">
        {[
          { icon: "users", color: "primary", label: "Usuarios", valor: resumen.usuarios },
          { icon: "cogs", color: "success", label: "Lavadoras Activas", valor: resumen.lavadoras_activas },
          { icon: "calendar-check", color: "warning", label: "Agendamientos", valor: resumen.agendamientos },
          { icon: "dollar-sign", color: "info", label: "Pagos Completados", valor: resumen.pagos },
        ].map((c, i) => (
          <Col md={6} lg={3} key={i}>
            <Card className="shadow-sm border-0 text-center h-100">
              <Card.Body>
                <i className={`fas fa-${c.icon} fs-2 text-${c.color} mb-2`}></i>
                <Card.Title className="small text-muted">{c.label}</Card.Title>
                <Card.Text className="fs-4 fw-bold text-dark">{c.valor}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Estadísticas */}
      <Row className="g-3 mb-4">
        <Col lg={6}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <Card.Title className="text-center mb-3">
                <i className="fas fa-chart-bar text-info me-2"></i> Estadísticas del mes
              </Card.Title>
              {estadisticas ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[estadisticas]}>
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="agendamientos" fill="#17a2b8" name="Agendamientos" />
                    <Bar dataKey="servicios_finalizados" fill="#28a745" name="Finalizados" />
                    <Bar dataKey="ingresos_total" fill="#ffc107" name="Ingresos ($)" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-5 text-muted">
                  <p>No hay estadísticas disponibles</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <Card.Title className="text-center mb-3">
                <i className="fas fa-chart-pie text-danger me-2"></i> Servicios Populares
              </Card.Title>
              {serviciosPopulares.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie 
                      data={serviciosPopulares} 
                      dataKey="total_agendamientos" 
                      nameKey="servicio" 
                      cx="50%" 
                      cy="50%" 
                      outerRadius={100} 
                      label
                    >
                      {serviciosPopulares.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-5 text-muted">
                  <i className="fas fa-chart-pie fa-3x mb-3 text-muted"></i>
                  <p>No hay datos de servicios</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tabla de Agendamientos */}
      <Card className="shadow-sm border-0">
        <Card.Body>
          <Card.Title className="mb-3">
            <i className="fas fa-calendar-alt me-2 text-info"></i> Agendamientos Recientes
          </Card.Title>
          {agendamientosFiltrados.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="fas fa-inbox fa-3x mb-3"></i>
              <p>No hay agendamientos que mostrar</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover>
                <thead className="table-light">
                  <tr>
                    <th>ID</th>
                    <th>Cliente</th>
                    <th>Servicio</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {agendamientosFiltrados.map((item) => {
                    const estado = getEstadoBadge(item.estado);
                    return (
                      <tr key={item.id}>
                        <td className="fw-bold">#{String(item.id).padStart(3, '0')}</td>
                        <td>
                          <i className="fas fa-user-circle me-2 text-muted"></i>
                          {item.cliente}
                        </td>
                        <td>{item.servicio}</td>
                        <td>
                          <i className="fas fa-calendar me-2 text-muted"></i>
                          {item.fecha}
                        </td>
                        <td>
                          <Badge bg={estado.bg}>{estado.text}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdminDashboard;