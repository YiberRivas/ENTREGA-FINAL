import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../assets/estilos/ClienteStile.css';

const SidebarCliente = ({ isOpen, onClose }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/cliente', icon: '📊', label: 'Inicio' },
    { path: '/cliente/perfil', icon: '👤', label: 'Mi Perfil' },
    { path: '/cliente/servicios', icon: '🛠️', label: 'Servicios' },
    { path: '/cliente/agendar', icon: '📅', label: 'Agendar' },
    { path: '/cliente/agendamientos', icon: '🗓️', label: 'Agendamientos' },
    { path: '/cliente/historial', icon: '📋', label: 'Historial' },
  ];

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div 
          className="sl-overlay"
          onClick={onClose}
        />
      )}
      
      <aside className={`sl-sidebar ${isOpen ? 'mobile-open' : ''}`}>
        {/* Navegación */}
        <nav className="sl-sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sl-nav-link ${
                location.pathname === item.path ? 'active' : ''
              }`}
              onClick={() => window.innerWidth <= 768 && onClose()}
            >
              <span className="sl-nav-icon">{item.icon}</span>
              <span className="sl-nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default SidebarCliente;