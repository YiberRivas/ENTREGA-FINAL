import React from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

/**
 * Sidebar de navegación para el rol de Cliente.
 * Utiliza Nav.Link con Link de React Router para navegación,
 * eliminando la dependencia de LinkContainer que genera el error.
 */
export default function ClienteSidebar() {
    // Hook para saber qué ruta está activa y aplicar estilos
    const location = useLocation();

    // Función para manejar el cierre de sesión (Logout)
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        // Nota: Al usar <Link to="/login" replace />, la navegación es manejada por el Router.
    };

    const navItems = [
        { path: '/cliente/perfil', name: 'Perfil', icon: 'fas fa-user-circle' },
        { path: '/cliente/servicios', name: 'Servicios', icon: 'fas fa-tools' },
        { path: '/cliente/citas', name: 'Mis Citas', icon: 'fas fa-calendar-alt' },
        { path: '/cliente/historial', name: 'Historial', icon: 'fas fa-history' },
    ];

    return (
        <Navbar 
            bg="dark" 
            variant="dark" 
            className="flex-column p-3 min-vh-100" 
            expand="lg"
            style={{ width: '250px' }} // Establece un ancho fijo para el sidebar
        >
            <Navbar.Brand href="#home" className="mb-3">
                <i className="fas fa-wrench me-2"></i> 
                ServiLavadoras
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav" className="flex-column align-items-start">
                <Nav className="flex-column w-100">
                    <div className="text-white fw-bold mb-2 mt-3">MENÚ PRINCIPAL</div>
                    
                    {navItems.map((item) => (
                        // 🌟 ESTA ES LA CLAVE: Usamos Nav.Link de Bootstrap y Link de React Router
                        // Sin LinkContainer.
                        <Nav.Link 
                            key={item.path}
                            as={Link}
                            to={item.path}
                            active={location.pathname.startsWith(item.path)}
                            className="text-white rounded-md mb-1 transition duration-150 ease-in-out hover:bg-secondary"
                        >
                            <i className={`${item.icon} me-2`}></i>
                            {item.name}
                        </Nav.Link>
                    ))}

                    <div className="text-white fw-bold mb-2 mt-4">SESIÓN</div>

                    {/* Botón de Cerrar Sesión */}
                    <Nav.Link 
                        as={Link}
                        to="/login"
                        onClick={handleLogout}
                        className="text-danger rounded-md transition duration-150 ease-in-out hover:bg-secondary"
                        replace
                    >
                        <i className="fas fa-sign-out-alt me-2"></i>
                        Cerrar Sesión
                    </Nav.Link>
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
}