import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Spinner, Badge, Button, Form } from 'react-bootstrap';
import api from "../../api/axiosConfig";
import Swal from "sweetalert2";

// ⚠️ MOCK - REEMPLAZAR cuando tengas login real
const useAuth = () => ({ personaId: 1 });

const ClienteHistorial = () => {
    const { personaId } = useAuth();

    const [historial, setHistorial] = useState([]);
    const [loading, setLoading] = useState(true);

    // 🔍 Buscador
    const [busqueda, setBusqueda] = useState("");

    // 📄 Paginación
    const [paginaActual, setPaginaActual] = useState(1);
    const itemsPorPagina = 5;

    useEffect(() => {
        const fetchHistorial = async () => {
            if (!personaId) return;

            try {
                const resAgendamientos = await api.get("/agendamientos/");

                const serviciosFinalizados = (resAgendamientos.data || [])
                    .filter(
                        ag =>
                            ag.persona_id === personaId &&
                            ["finalizado", "pagada", "cancelado"].includes(String(ag.estado))
                    );

                setHistorial(serviciosFinalizados);
            } catch (error) {
                Swal.fire("Error", "No se pudo cargar el historial de servicios.", "error");
                console.error("Fetch Historial Error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistorial();
    }, [personaId]);

    // ============================
    // 🔍 FILTRO DE BÚSQUEDA
    // ============================
    const historialFiltrado = historial.filter((row) =>
        (row.servicio?.nombre_servicio || "").toLowerCase().includes(busqueda.toLowerCase())
    );

    // ============================
    // 📄 PAGINACIÓN
    // ============================
    const totalPaginas = Math.ceil(historialFiltrado.length / itemsPorPagina) || 1;
    const indiceInicial = (paginaActual - 1) * itemsPorPagina;
    const indiceFinal = indiceInicial + itemsPorPagina;

    const paginaDatos = historialFiltrado.slice(indiceInicial, indiceFinal);

    const cambiarPagina = (nueva) => {
        if (nueva >= 1 && nueva <= totalPaginas) {
            setPaginaActual(nueva);
        }
    };

    if (loading) {
        return (
            <div className="p-4 flex-grow-1 d-flex justify-content-center align-items-center">
                <Spinner animation="border" variant="info" />
            </div>
        );
    }

    return (
        <div className="p-4 flex-grow-1" style={{ background: "#f8f9fa" }}>
            <Container fluid>
                <h2 className="mb-4 text-secondary fw-bold">
                    <i className="fas fa-history me-2"></i> Historial de Servicios
                </h2>

                {/* 🔍 Buscador */}
                <div className="mb-3" style={{ maxWidth: "350px" }}>
                    <Form.Control
                        type="text"
                        placeholder="Buscar servicio..."
                        value={busqueda}
                        onChange={(e) => {
                            setBusqueda(e.target.value);
                            setPaginaActual(1);
                        }}
                    />
                </div>

                <Card className="shadow-sm">
                    <Card.Body>
                        <div className="table-responsive">
                            <Table striped bordered hover className="align-middle text-center mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>N°</th>
                                        <th>Servicio</th>
                                        <th>Fecha</th>
                                        <th>Estado Final</th>
                                        <th>Total</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginaDatos.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="text-muted py-4">
                                                No hay servicios en el historial.
                                            </td>
                                        </tr>
                                    ) : (
                                        paginaDatos.map((row, index) => (
                                            <tr key={index}>
                                                {/* ID auto-incremental global (no por página) */}
                                                <td className="fw-bold text-info">
                                                    {indiceInicial + index + 1}
                                                </td>

                                                <td>{row.servicio?.nombre_servicio || "N/A"}</td>
                                                <td>{row.fecha}</td>

                                                <td>
                                                    <Badge
                                                        bg={
                                                            row.estado === "finalizado"
                                                                ? "success"
                                                                : row.estado === "cancelado"
                                                                ? "danger"
                                                                : "primary"
                                                        }
                                                    >
                                                        {row.estado.toUpperCase()}
                                                    </Badge>
                                                </td>

                                                <td>${row.factura?.total || "N/A"}</td>

                                                <td>
                                                    <Button size="sm" variant="outline-info" disabled>
                                                        <i className="fas fa-file-invoice me-1"></i>
                                                        Ver Factura
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </Table>
                        </div>

                        {/* PAGINACIÓN */}
                        {totalPaginas > 1 && (
                            <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap">
                                <Button
                                    size="sm"
                                    variant="light"
                                    disabled={paginaActual === 1}
                                    onClick={() => cambiarPagina(paginaActual - 1)}
                                >
                                    ◀ Anterior
                                </Button>

                                <span className="fw-semibold">
                                    Página {paginaActual} / {totalPaginas}
                                </span>

                                <Button
                                    size="sm"
                                    variant="light"
                                    disabled={paginaActual === totalPaginas}
                                    onClick={() => cambiarPagina(paginaActual + 1)}
                                >
                                    Siguiente ▶
                                </Button>
                            </div>
                        )}
                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
};

export default ClienteHistorial;
