import React from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import "../../assets/estilos/ClienteStile.css"; // <-- IMPORTA EL CSS AQUÍ

export default function ClienteSidebar() {
    const location = useLocation();

    const navItems = [
        { path: '/cliente/servicios', name: 'Servicios', icon: 'fas fa-tools' },
        { path: '/cliente/citas', name: 'Mis Citas', icon: 'fas fa-calendar-alt' },
        { path: '/cliente/historial', name: 'Historial', icon: 'fas fa-history' },
    ];

    return (
        <Navbar 
            className="flex-column p-3 min-vh-100 sidebar-cliente"
            expand="lg"
        >
            <Navbar.Brand className="mb-3 text-white fw-bold">
                <i className="fas fa-wrench me-2"></i> ServiLavadoras
            </Navbar.Brand>

            <Navbar.Toggle aria-controls="basic-navbar-nav" />

            <Navbar.Collapse className="flex-column align-items-start">
                <div className="menu">
                    {navItems.map((item) => (
                        <Nav.Link 
                            key={item.path}
                            as={Link}
                            to={item.path}
                            className={`menu-item ${location.pathname.startsWith(item.path) ? "active" : ""}`}
                        >
                            <i className={`${item.icon} me-2`}></i>
                            {item.name}
                        </Nav.Link>
                    ))}
                </div>
            </Navbar.Collapse>
        </Navbar>
    );
}
