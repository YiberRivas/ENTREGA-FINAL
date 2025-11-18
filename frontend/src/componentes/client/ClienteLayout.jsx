import React from 'react';
import { Outlet } from 'react-router-dom';
import ClienteSidebar from './ClienteSidebar';
import ClienteHeader from './ClienteHeader';

const ClienteLayout = () => {
    return (
        <div className="d-flex" style={{ minHeight: '100vh' }}>
            
            {/* Sidebar a la izquierda */}
            <ClienteSidebar />

            {/* Contenido principal */}
            <div className="flex-grow-1 bg-light">

                {/* Header superior con foto + cerrar sesión */}
                <ClienteHeader />

                {/* Contenido dinámico */}
                <div className="p-4">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default ClienteLayout;
