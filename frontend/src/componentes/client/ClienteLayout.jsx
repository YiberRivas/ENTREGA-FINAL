import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import HeaderCliente from './HeaderCliente';
import SidebarCliente from './SidebarCliente';
import Footer from './Footer';
import '../../assets/estilos/ClienteStile.css';

const Clientelayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Cerrar sidebar al cambiar tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="sl-layout">
      {/* Header con icono de perfil */}
      <HeaderCliente />

      {/* Sidebar de navegación */}
      <SidebarCliente 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Contenido principal */}
      <main className="sl-main-content">
        <Outlet />
        <Footer />
      </main>
    </div>
  );
};

export default Clientelayout;