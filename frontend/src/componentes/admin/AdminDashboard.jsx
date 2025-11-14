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

  const COLORS = ["#17a2b8", "#28a745", "#ffc107", "#dc3545", "#6610f2"];

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
      console.error("Error al obtener datos:", error);
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
      <div className="d-flex flex-column justify-content-center align-items-center vh-100">
        <Spinner
          animation="border"
          variant="info"
          style={{ width: "3rem", height: "3rem" }}
        />
        <p className="mt-3 text-muted">Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <Container fluid className="admin-dashboard p-4">
      {/* === Tarjetas resumen === */}
      <Row className="g-3 mb-4">
        {[
          { icon: "users", color: "primary", label: "Usuarios", valor: resumen.usuarios },
          { icon: "cogs", color: "success", label: "Lavadoras Activas", valor: resumen.lavadoras_activas },
          { icon: "calendar-check", color: "warning", label: "Agendamientos", valor: resumen.agendamientos },
          { icon: "dollar-sign", color: "info", label: "Pagos Completados", valor: resumen.pagos },
        ].map((c, i) => (
          <Col md={6} lg={3} key={i}>
            <Card className={`summary-card border-0 shadow-sm h-100 summary-${c.color}`}>
              <Card.Body className="text-center">
                <div className={`icon-circle bg-${c.color}-soft mb-3`}>
                  <i className={`fas fa-${c.icon} fs-3 text-${c.color}`}></i>
                </div>
                <Card.Title className="small text-uppercase fw-semibold text-muted">{c.label}</Card.Title>
                <Card.Text className="fs-3 fw-bold text-dark mb-0">{c.valor}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* === Gráfica: Tendencia Semanal === */}
      <Row className="g-4 mb-4">
        <Col lg={12}>
          <Card className="chart-card border-0 shadow-lg rounded-4">
            <Card.Body>
              <Card.Title className="text-center fw-semibold text-dark mb-4">
                <i className="fas fa-chart-line me-2 text-info"></i> Tendencia Semanal de Agendamientos
              </Card.Title>
              {tendenciaSemanal.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={tendenciaSemanal}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                    <XAxis dataKey="semana" tick={{ fill: "#6c757d" }} />
                    <YAxis tick={{ fill: "#6c757d" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        borderRadius: "10px",
                        border: "1px solid #dee2e6",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      }}
                    />
                    <Legend verticalAlign="bottom" iconType="circle" />
                    <Line
                      type="monotone"
                      dataKey="agendamientos"
                      stroke="#0d6efd"
                      strokeWidth={3}
                      dot={{ r: 5 }}
                      activeDot={{ r: 7 }}
                      name="Agendamientos"
                    />
                    <Line
                      type="monotone"
                      dataKey="finalizados"
                      stroke="#198754"
                      strokeWidth={3}
                      dot={{ r: 5 }}
                      activeDot={{ r: 7 }}
                      name="Finalizados"
                    />
                    <Line
                      type="monotone"
                      dataKey="cancelados"
                      stroke="#dc3545"
                      strokeWidth={3}
                      dot={{ r: 5 }}
                      activeDot={{ r: 7 }}
                      name="Cancelados"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-5 text-muted">
                  No hay datos de tendencia semanal
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* === Gráficas mensuales y servicios === */}
      <Row className="g-4 mb-4">
        <Col lg={6}>
          <Card className="chart-card border-0 shadow-lg rounded-4">
            <Card.Body>
              <Card.Title className="text-center fw-semibold text-dark mb-4">
                <i className="fas fa-chart-bar me-2 text-primary"></i> Estadísticas del Mes
              </Card.Title>
              {estadisticas ? (
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
                    <XAxis dataKey="mes" tick={{ fill: "#6c757d", fontSize: 13 }} />
                    <YAxis tick={{ fill: "#6c757d", fontSize: 13 }} />
                    <Tooltip
                      cursor={{ fill: "rgba(0,0,0,0.05)" }}
                      contentStyle={{
                        backgroundColor: "#fff",
                        borderRadius: "10px",
                        border: "1px solid #dee2e6",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      }}
                    />
                    <Bar dataKey="agendamientos" fill="#0d6efd" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="finalizados" fill="#198754" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="ingresos" fill="#ffc107" radius={[8, 8, 0, 0]} />
                    <Legend verticalAlign="bottom" iconType="circle" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-5 text-muted">No hay estadísticas disponibles</div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="chart-card border-0 shadow-lg rounded-4">
            <Card.Body>
              <Card.Title className="text-center fw-semibold text-dark mb-4">
                <i className="fas fa-chart-pie me-2 text-danger"></i> Servicios Más Solicitados
              </Card.Title>
              {serviciosPopulares.length > 0 ? (
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
                      paddingAngle={5}
                      stroke="#fff"
                      strokeWidth={3}
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                    >
                      {serviciosPopulares.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        borderRadius: "10px",
                        border: "1px solid #dee2e6",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      }}
                    />
                    <Legend verticalAlign="bottom" iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-5 text-muted">No hay datos de servicios</div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* === Tabla de Agendamientos === */}
      <Card className="agendamientos-card border-0 shadow-lg rounded-4">
        <Card.Body>
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
            <h5 className="fw-semibold text-dark mb-0">
              <i className="fas fa-calendar-alt me-2 text-primary"></i> Agendamientos Recientes
            </h5>
            <div className="d-flex gap-2 flex-wrap">
              <Form.Select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="filter-select"
              >
                <option value="">Todos los estados</option>
                <option value="pendiente">Pendiente</option>
                <option value="confirmado">Confirmado</option>
                <option value="en_proceso">En Proceso</option>
                <option value="finalizado">Finalizado</option>
                <option value="cancelado">Cancelado</option>
              </Form.Select>

              <Form.Control
                type="text"
                placeholder="🔍 Buscar cliente o servicio..."
                className="search-input"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              />
            </div>
          </div>

          <div style={{ minHeight: "350px" }}>
            {agendamientosFiltrados.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <i className="fas fa-inbox fa-3x mb-3"></i>
                <p>No hay agendamientos que mostrar</p>
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <Table hover className="align-middle custom-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Cliente</th>
                        <th>Servicio</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {agendamientosPaginados.map((item) => {
                        const estado = getEstadoBadge(item.estado);
                        return (
                          <tr key={item.id}>
                            <td className="fw-bold text-primary">
                              #{String(item.id).padStart(3, "0")}
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
                </div>

                {/* === Paginación === */}
                <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
                  <small className="text-muted">
                    Mostrando {indiceInicial + 1} -{" "}
                    {Math.min(indiceFinal, agendamientosFiltrados.length)} de{" "}
                    {agendamientosFiltrados.length}
                  </small>
                  <div className="pagination-controls">
                    <button
                      className="btn-paginacion"
                      disabled={paginaActual === 1}
                      onClick={() => setPaginaActual((prev) => prev - 1)}
                    >
                      ◀ Anterior
                    </button>
                    <span className="mx-2 fw-semibold text-dark">
                      {paginaActual}
                    </span>
                    <button
                      className="btn-paginacion"
                      disabled={indiceFinal >= agendamientosFiltrados.length}
                      onClick={() => setPaginaActual((prev) => prev + 1)}
                    >
                      Siguiente ▶
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdminDashboard;