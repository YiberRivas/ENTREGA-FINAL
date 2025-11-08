import React from "react";
import { Nav } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

const AdminSidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    Swal.fire({
      title: "¿Deseas cerrar sesión?",
      text: "Tu sesión será finalizada y volverás al login.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#17a2b8",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, salir",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");

        Swal.fire({
          title: "Sesión cerrada",
          text: "Hasta pronto 👋",
          icon: "success",
          confirmButtonColor: "#17a2b8",
          timer: 1500,
          showConfirmButton: false,
        });

        setTimeout(() => navigate("/login"), 1200);
      }
    });
  };

  const links = [
    { path: "/admin/inicio", icon: "fa-home", label: "Inicio" },
    { path: "/admin/usuarios", icon: "fa-users", label: "Usuarios" },
    { path: "/admin/servicios", icon: "fa-cogs", label: "Servicios" },
    { path: "/admin/agendar", icon: "fa-calendar-check", label: "Agendar " },
    { path: "/admin/pagos", icon: "fa-credit-card", label: "Pagos" },
  ];

  return (
    <aside
      className="d-flex flex-column p-3"
      style={{
        backgroundColor: "#17a2b8",
        minHeight: "100vh",
        width: "250px",
        position: "fixed",
        left: 0,
        top: 0,
      }}
    >
      <div className="d-flex align-items-center mb-4 text-white fs-5 fw-bold">
        <i className="fas fa-tint me-2"></i> ServiLavadora
      </div>

      <Nav className="flex-column">
        {links.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-link text-white mb-2 ${
                isActive ? "fw-bold bg-white bg-opacity-25 rounded" : ""
              }`
            }
            style={{
              transition: "all 0.3s ease",
              padding: "10px 12px",
              borderRadius: "10px",
            }}
          >
            <i className={`fas ${item.icon} me-2`}></i> {item.label}
          </NavLink>
        ))}

        <Nav.Link
          as="button"
          onClick={handleLogout}
          className="text-white text-start mb-2 rounded logout-btn"
          style={{
            backgroundColor: "transparent",
            border: "none",
            padding: "10px 12px",
            transition: "all 0.3s ease",
          }}
        >
          <i className="fas fa-sign-out-alt me-2"></i> Salir
        </Nav.Link>
      </Nav>

      <style>{`
        .nav-link:hover,
        .logout-btn:hover {
          background-color: rgba(255, 255, 255, 0.25) !important;
        }
      `}</style>
    </aside>
  );
};

export default AdminSidebar;
