import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Dropdown } from "react-bootstrap";
import Swal from "sweetalert2";
import AdminSidebar from "./AdminSidebar";
import "../../assets/estilos/AdminLayout.css";

const AdminLayout = () => {
  const [usuario, setUsuario] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const userData = localStorage.getItem("usuario");
      if (userData) {
        const usuarioParseado = JSON.parse(userData);
        /* console.log("👤 Usuario cargado:", usuarioParseado); */
        setUsuario(usuarioParseado);
      }
    } catch (error) {
      console.error("❌ Error al parsear usuario:", error);
      localStorage.removeItem("usuario");
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    Swal.fire({
      title: "¿Cerrar sesión?",
      text: "¿Estás seguro que deseas salir?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, salir",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        Swal.fire({
          icon: "success",
          title: "Sesión cerrada",
          text: "Has cerrado sesión correctamente",
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          navigate("/login");
        });
      }
    });
  };

  const handleVerPerfil = () => {
    Swal.fire({
      title: "Mi Perfil",
      html: `
        <div style="text-align: left; padding: 20px;">
          <p><strong>👤 Usuario:</strong> ${usuario?.usuario || "N/A"}</p>
          <p><strong>📛 Nombre:</strong> ${usuario?.nombre || "N/A"}</p>
          <p><strong>📧 Correo:</strong> ${usuario?.correo || "No registrado"}</p>
          <p><strong>🎭 Rol:</strong> <span style="text-transform: capitalize;">${usuario?.rol || "N/A"}</span></p>
          <p><strong>✅ Estado:</strong> ${usuario?.activo ? '<span style="color: #28a745;">Activo</span>' : '<span style="color: #dc3545;">Inactivo</span>'}</p>
        </div>
      `,
      icon: "info",
      confirmButtonText: "Cerrar",
      confirmButtonColor: "#17a2b8",
    });
  };

  return (
    <div className="admin-layout-container">
      <AdminSidebar />
      
      <div className="admin-main-content">
        {/* Header con perfil */}
        <header className="admin-top-header">
          <div className="header-content">
            <div className="header-left">
              <h4 className="header-title">
                <i className="fas fa-tachometer-alt me-2"></i>
                Panel Administrativo
              </h4>
            </div>
            
            <div className="header-right">
              <Dropdown align="end">
                <Dropdown.Toggle 
                  variant="link" 
                  id="dropdown-perfil" 
                  className="profile-dropdown-toggle"
                >
                  <div className="user-profile-header">
                    <div className="user-avatar">
                      <i className="fas fa-user-circle"></i>
                    </div>
                    <div className="user-info">
                      <span className="user-name">
                        {usuario?.nombre || usuario?.usuario || "Administrador"}
                      </span>
                      <small className="user-role">
                        {usuario?.rol || "administrador"}
                      </small>
                    </div>
                    <i className="fas fa-chevron-down ms-2"></i>
                  </div>
                </Dropdown.Toggle>

                <Dropdown.Menu className="profile-dropdown-menu">
                  <Dropdown.Item onClick={handleVerPerfil} className="dropdown-item-custom">
                    <i className="fas fa-user me-2"></i>
                    Ver Perfil
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout} className="dropdown-item-custom logout-item">
                    <i className="fas fa-sign-out-alt me-2"></i>
                    Cerrar Sesión
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>
        </header>

        {/* Contenido principal */}
        <div className="admin-content-wrapper">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;