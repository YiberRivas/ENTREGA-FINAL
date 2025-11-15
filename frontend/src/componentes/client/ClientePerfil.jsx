import React from 'react';

const ClientePerfil = () => {
  return (
    <div>
      <div className="sl-main-header">
        <h1 className="sl-main-title">Mi Perfil</h1>
        <p className="sl-main-subtitle">
          Gestiona tu información personal y preferencias
        </p>
      </div>

      <div className="sl-content">
        <div style={{ 
          padding: '20px', 
          background: 'white', 
          borderRadius: 'var(--sl-border-radius)',
          boxShadow: 'var(--sl-shadow)'
        }}>
          <h3>Configuración adicional del perfil</h3>
          <p>Contenido de la página de perfil...</p>
        </div>
      </div>
    </div>
  );
};

export default ClientePerfil;