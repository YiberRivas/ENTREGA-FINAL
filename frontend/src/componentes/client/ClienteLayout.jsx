import React from 'react';
import { Outlet } from 'react-router-dom';
import ClienteSidebar from './ClienteSidebar';


const ClienteLayout = () => {
    return (
        <div className="d-flex" style={{ minHeight: '100vh' }}>
            <ClienteSidebar />
            <div className="flex-grow-1">
                {/* Outlet renderiza el componente de la ruta anidada */}
                <Outlet /> 
            </div>
        </div>
    );
};

export default ClienteLayout;