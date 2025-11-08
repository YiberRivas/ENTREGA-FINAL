// src/componentes/admin/AdminLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

const AdminLayout = () => {
  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <AdminSidebar />
      <div style={{ marginLeft: "250px", flexGrow: 1, padding: "2rem", backgroundColor: "#f8f9fa" }}>
        {/* Aquí se renderizan las páginas hijas */}
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
