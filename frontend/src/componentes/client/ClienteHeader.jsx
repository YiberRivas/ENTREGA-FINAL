import React from "react";
import { Navbar, Nav, Dropdown, Image } from "react-bootstrap";
import { useNavigate } from "react-router-dom";



export default function ClienteHeader() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");

        navigate("/login", { replace: true });
    };

    return (
        <Navbar 
            bg="light"
            className="shadow-sm px-4 d-flex justify-content-end align-items-center"
            style={{ height: "70px" }}
        >
            <Nav className="align-items-center">

                {/* ==== Icono + menú del usuario ==== */}
                <Dropdown align="end">
                    <Dropdown.Toggle
                        variant="light"
                        id="dropdown-basic"
                        className="d-flex align-items-center border-0 bg-transparent"
                        style={{ boxShadow: "none" }}
                    >
                        {/* Ícono del usuario */}
                        <Image
                            src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                            roundedCircle
                            width="40"
                            height="40"
                            className="me-2"
                        />
                        <span className="fw-semibold text-dark">Mi Cuenta</span>
                    </Dropdown.Toggle>

                    <Dropdown.Menu className="shadow-sm">
                        <Dropdown.Item onClick={() => navigate("/cliente/perfil")}>
                            <i className="fas fa-user me-2"></i> Perfil
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item className="text-danger fw-semibold" onClick={handleLogout}>
                            <i className="fas fa-sign-out-alt me-2"></i> Cerrar Sesión
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </Nav>
        </Navbar>
    );
}
