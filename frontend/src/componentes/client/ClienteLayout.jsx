import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { Dropdown } from "react-bootstrap";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "../../assets/estilos/ClienteStile.css";

export default function ClienteLayout() {
  const [usuario, setUsuario] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("usuario");
    if (userData) {
      setUsuario(JSON.parse(userData));
    }
  }, []);

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
        navigate("/inicio");
      }
    });
  };

  return (
    <div className="cliente-layout" style={{ display: "flex", minHeight: "100vh" }}>
      
      {/* Sidebar izquierda */}
      <aside
        className="sidebar"
        style={{
          width: "260px",
          background: "#1f1f1f",
          color: "white",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        
        {/* Encabezado del sidebar */}
        <div>
          <h4 className="mb-4 text-center">
            <i className="bi bi-person-circle"></i> Portal Cliente
          </h4>

          {/* Menú de navegación */}
          <nav className="menu" > 
            <NavLink
              to="/cliente/perfil"
              className="menu-item"
            >
              <i className="bi bi-person"></i> Mi Perfil
            </NavLink>

            <NavLink
              to="/cliente/servicios"
              className="menu-item"
            >
              <i className="bi bi-tools"></i> Servicios
            </NavLink>

            <NavLink
              to="/cliente/agendamientos"
              className="menu-item"
            >
              <i className="bi bi-calendar-check"></i> Mis Agendamientos
            </NavLink>

            <NavLink
              to="/cliente/historial"
              className="menu-item"
            >
              <i className="bi bi-clock-history"></i> Historial
            </NavLink>
          </nav>
        </div>

        {/* Usuario abajo */}
        <div className="user-section text-center">
          <Dropdown>
            <Dropdown.Toggle variant="outline-light" className="w-100">
              {usuario?.nombre || "Usuario"}
            </Dropdown.Toggle>

            <Dropdown.Menu className="w-100 text-center">
              <Dropdown.Item disabled>
                <small className="text-muted">{usuario?.correo}</small>
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={handleLogout}>
                <i className="bi bi-box-arrow-right"></i> Cerrar Sesión
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </aside>

      {/* Contenido */}
      <main
        className="cliente-content"
        style={{
          flexGrow: 1,
          background: "#f4f4f4",
          padding: "25px",
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}
