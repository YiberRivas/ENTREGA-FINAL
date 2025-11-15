import React, { useState, useRef, useEffect } from 'react';
import '../../assets/estilos/ClienteStile.css';

const HeaderCliente = () => {
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleProfile = () => {
    setProfileOpen(!profileOpen);
  };

  return (
    <>
      {/* Overlay */}
      {profileOpen && (
        <div 
          className={`sl-overlay ${profileOpen ? 'open' : ''}`}
          onClick={() => setProfileOpen(false)}
        />
      )}

      {/* Header Superior */}
      <header className="sl-top-header">
        <div className="sl-header-brand">
          <div className="sl-header-logo">SL</div>
          <div className="sl-header-title">Servilavadora</div>
        </div>

        {/* Icono de Perfil */}
        <div 
          className="sl-profile-icon"
          onClick={toggleProfile}
          ref={dropdownRef}
        >
          PM
        </div>

        {/* Panel Desplegable del Perfil */}
        <div 
          className={`sl-profile-dropdown ${profileOpen ? 'open' : ''}`}
          ref={dropdownRef}
        >
          <div className="sl-profile-panel">
            {/* Header del Perfil */}
            <div className="sl-profile-header">
              <div className="sl-user-main">
                <div className="sl-user-avatar">PM</div>
                <div className="sl-user-details">
                  <div className="sl-user-name">perla mensa</div>
                  <div className="sl-user-email">sminad@gmail.com</div>
                  <div className="sl-user-badges">
                    <div className="sl-badge sl-badge-premium">Conseguimiento</div>
                    <div className="sl-badge sl-badge-verified">Advertido</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Información Personal */}
            <div className="sl-profile-info">
              <div className="sl-info-group">
                <h3 className="sl-info-title">👤 Información Personal</h3>
                <div className="sl-info-item">
                  <span className="sl-info-label">Nombre de Usuario</span>
                  <span className="sl-info-value">nico</span>
                </div>
                <div className="sl-info-item">
                  <span className="sl-info-label">Correo Electrónico</span>
                  <span className="sl-info-value">sminad@gmail.com</span>
                </div>
                <div className="sl-info-item">
                  <span className="sl-info-label">Dirección</span>
                  <span className="sl-info-value">No registrada</span>
                </div>
              </div>

              <div className="sl-info-group">
                <h3 className="sl-info-title">🔒 Seguridad</h3>
                <div className="sl-info-item">
                  <span className="sl-info-label">Cambiar Contraseña</span>
                  <span className="sl-info-value">Disponible</span>
                </div>
                <div className="sl-info-item">
                  <span className="sl-info-label">Autenticación de Dos Factores</span>
                  <span className="sl-info-value">No activada</span>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="sl-profile-actions">
              <button className="sl-logout-btn">
                <span>🚪</span>
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default HeaderCliente;