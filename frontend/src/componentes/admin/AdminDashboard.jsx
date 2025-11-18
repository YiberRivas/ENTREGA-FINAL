import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Form,
  Spinner,
  Badge,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig";
import Swal from "sweetalert2";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

import "../../assets/estilos/AdminDashboard.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [resumen, setResumen] = useState({
    usuarios: 0,
    lavadoras_activas: 0,
    agendamientos: 0,
    pagos: 0,
  });
  const [agendamientos, setAgendamientos] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [serviciosPopulares, setServiciosPopulares] = useState([]);
  const [tendenciaSemanal, setTendenciaSemanal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);

  const itemsPorPagina = 6;

  // Detectar dark mode del sistema
  const darkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;

  // Colores que cambian según modo
  const textPrimary = darkMode ? "#e9ecef" : "#212529";
  const textSecondary = darkMode ? "#adb5bd" : "#495057";
  const cardBg = darkMode ? "#1e1e1e" : "#ffffff";
  const tableBg = darkMode ? "#262626" : "#ffffff";
  const borderColor = darkMode ? "#333" : "#e9ecef";

  const COLORS = darkMode
    ? ["#4dabf7", "#51cf66", "#ffd43b", "#ff6b6b", "#845ef7"]
    : ["#0d6efd", "#198754", "#ffc107", "#dc3545", "#6f42c1"];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [
        resResumen,
        resAg,
        resEstadisticas,
        resPopulares,
        resTendencia,
      ] = await Promise.all([
        api.get("/admin/resumen"),
        api.get("/admin/agendamientos_recientes?limite=50"),
        api.get("/admin/estadisticas/mes"),
        api.get("/admin/servicios/populares"),
        api.get("/admin/tendencia/semana"),
      ]);

      setResumen(resResumen.data);
      setAgendamientos(resAg.data);
      setEstadisticas(resEstadisticas.data);
      setServiciosPopulares(resPopulares.data);
      setTendenciaSemanal(resTendencia.data);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error al cargar datos",
        text:
          error.response?.data?.detail ||
          "No se pudieron obtener los datos del dashboard",
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
    const cumpleTexto =
      a.cliente.toLowerCase().includes(busqueda) ||
      a.servicio.toLowerCase().includes(busqueda);
    const cumpleEstado = filtroEstado ? a.estado === filtroEstado : true;
    return cumpleTexto && cumpleEstado;
  });

  const indiceInicial = (paginaActual - 1) * itemsPorPagina;
  const indiceFinal = indiceInicial + itemsPorPagina;
  const agendamientosPaginados = agendamientosFiltrados.slice(
    indiceInicial,
    indiceFinal
  );

  if (loading) {
    return (
      <div
        className="d-flex flex-column justify-content-center align-items-center vh-100"
        style={{ color: textSecondary }}
      >
        <Spinner
          animation="border"
          variant="info"
          style={{ width: "3rem", height: "3rem" }}
        />
        <p className="mt-3">Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <Container fluid className="p-4" style={{ color: textPrimary }}>
      {/* === Tarjetas resumen === */}
      <Row className="g-3 mb-4">
        {[
          { icon: "users", color: "primary", label: "Usuarios", valor: resumen.usuarios },
          { icon: "cogs", color: "success", label: "Lavadoras Activas", valor: resumen.lavadoras_activas },
          { icon: "calendar-check", color: "warning", label: "Agendamientos", valor: resumen.agendamientos },
          { icon: "dollar-sign", color: "info", label: "Pagos Completados", valor: resumen.pagos },
        ].map((c, i) => (
          <Col md={6} lg={3} key={i}>
            <Card
              className="shadow-sm h-100"
              style={{
                background: cardBg,
                borderColor: borderColor,
              }}
            >
              <Card.Body className="text-center">
                <div className="mb-2">
                  <i className={`fas fa-${c.icon} fs-2 text-${c.color}`}></i>
                </div>
                <Card.Title className="small fw-semibold text-muted">
                  {c.label}
                </Card.Title>
                <Card.Text className="fs-3 fw-bold">{c.valor}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* === Gráfica: Tendencia Semanal === */}
      <Row className="g-4 mb-4">
        <Col lg={12}>
          <Card
            className="shadow-lg rounded-4"
            style={{ background: cardBg, borderColor }}
          >
            <Card.Body>
              <Card.Title className="text-center fw-semibold mb-4">
                Tendencia Semanal de Agendamientos
              </Card.Title>

              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={tendenciaSemanal}>
                  <CartesianGrid strokeDasharray="3 3" stroke={borderColor} />

                  <XAxis dataKey="semana" tick={{ fill: textSecondary }} />
                  <YAxis tick={{ fill: textSecondary }} />

                  <Tooltip
                    contentStyle={{
                      background: cardBg,
                      color: textPrimary,
                      borderRadius: "12px",
                      border: `1px solid ${borderColor}`,
                    }}
                  />

                  <Legend verticalAlign="top" />

                  <Line
                    type="monotone"
                    dataKey="agendamientos"
                    stroke={COLORS[0]}
                    strokeWidth={3}
                    dot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="finalizados"
                    stroke={COLORS[1]}
                    strokeWidth={3}
                    dot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="cancelados"
                    stroke={COLORS[3]}
                    strokeWidth={3}
                    dot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* === Gráficas estadísticas === */}
      <Row className="g-4 mb-4">
        {/* === BARCHART === */}
        <Col lg={6}>
          <Card
            className="shadow-lg rounded-4"
            style={{ background: cardBg, borderColor }}
          >
            <Card.Body>
              <Card.Title className="text-center fw-semibold mb-4">
                Estadísticas del Mes
              </Card.Title>

              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={[
                    {
                      mes: estadisticas.mes,
                      agendamientos: estadisticas.agendamientos,
                      finalizados: estadisticas.servicios_finalizados,
                      ingresos: estadisticas.ingresos_total,
                    },
                  ]}
                >
                  <XAxis dataKey="mes" tick={{ fill: textSecondary }} />
                  <YAxis tick={{ fill: textSecondary }} />
                  <Tooltip
                    contentStyle={{
                      background: cardBg,
                      color: textPrimary,
                      borderRadius: "12px",
                      border: `1px solid ${borderColor}`,
                    }}
                  />

                  <Bar dataKey="agendamientos" fill={COLORS[0]} radius={[8, 8, 0, 0]} />
                  <Bar dataKey="finalizados" fill={COLORS[1]} radius={[8, 8, 0, 0]} />
                  <Bar dataKey="ingresos" fill={COLORS[2]} radius={[8, 8, 0, 0]} />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        {/* === PIE === */}
        <Col lg={6}>
          <Card
            className="shadow-lg rounded-4"
            style={{ background: cardBg, borderColor }}
          >
            <Card.Body>
              <Card.Title className="text-center fw-semibold mb-4">
                Servicios Más Solicitados
              </Card.Title>

              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={serviciosPopulares}
                    dataKey="total_agendamientos"
                    nameKey="servicio"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={60}
                    label
                  >
                    {serviciosPopulares.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: cardBg,
                      color: textPrimary,
                      borderRadius: "12px",
                      border: `1px solid ${borderColor}`,
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* === TABLA === */}
      <Card
        className="shadow-lg rounded-4"
        style={{ background: cardBg, borderColor }}
      >
        <Card.Body>
          <div className="d-flex justify-content-between mb-3">
            <h5 className="fw-semibold">Agendamientos Recientes</h5>

            <div className="d-flex gap-2">
              <Form.Select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                style={{ background: cardBg, color: textPrimary }}
              >
                <option value="">Todos</option>
                <option value="pendiente">Pendiente</option>
                <option value="confirmado">Confirmado</option>
                <option value="en_proceso">En Proceso</option>
                <option value="finalizado">Finalizado</option>
                <option value="cancelado">Cancelado</option>
              </Form.Select>

              <Form.Control
                type="text"
                placeholder="Buscar..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                style={{ background: tableBg, color: textPrimary }}
              />
            </div>
          </div>

          <Table hover responsive bordered style={{ background: tableBg }}>
            <thead>
              <tr style={{ color: textSecondary }}>
                <th>N°</th>
                <th>Cliente</th>
                <th>Servicio</th>
                <th>Fecha</th>
                <th>Estado</th>
              </tr>
            </thead>

              <tbody>
            {agendamientosPaginados.map((item, index) => {
              const estado = getEstadoBadge(item.estado);

              return (
                <tr key={index}>
                  <td className="fw-bold text-primary">
                    #{String(indiceInicial + index + 1).padStart(1, "0")}
                  </td>

                  <td>
                    <i className="fas fa-user-circle me-2 text-secondary"></i>
                    {item.cliente}
                  </td>

                  <td>
                    <i className="fas fa-cogs me-2 text-muted"></i>
                    {item.servicio}
                  </td>

                  <td>
                    <i className="fas fa-calendar me-2 text-muted"></i>
                    {item.fecha}
                  </td>

                  <td>
                    <Badge bg={estado.bg} className="estado-badge">
                      {estado.text}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>

          </Table>

          {/* PAGINACIÓN */}
          <div className="d-flex justify-content-between align-items-center mt-2">
            <small>
              Mostrando {indiceInicial + 1} -{" "}
              {Math.min(indiceFinal, agendamientosFiltrados.length)} de{" "}
              {agendamientosFiltrados.length}
            </small>

            <div className="d-flex gap-2">
              <button
                className="btn btn-sm btn-outline-primary"
                disabled={paginaActual === 1}
                onClick={() => setPaginaActual((p) => p - 1)}
              >
                ◀
              </button>

              <span>{paginaActual}</span>

              <button
                className="btn btn-sm btn-outline-primary"
                disabled={indiceFinal >= agendamientosFiltrados.length}
                onClick={() => setPaginaActual((p) => p + 1)}
              >
                ▶
              </button>
            </div>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdminDashboard;
