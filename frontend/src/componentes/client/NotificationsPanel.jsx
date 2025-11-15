// En ClienteLayout.jsx
import { useState } from 'react';
import NotificationsPanel from './NotificationsPanel';


export default function ClienteLayout() {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <>
      {/* ... código existente del layout ... */}
      
      {/* En la sección de usuario, actualiza el icono de notificaciones: */}
      <div 
        style={{ cursor: 'pointer' }}
        onClick={() => setShowNotifications(true)}
      >
        <Bell size={22} />
        <Badge bg="danger" pill style={{ marginLeft: '-8px' }}>
          {unreadCount} {/* Debes manejar este estado */}
        </Badge>
      </div>

      {/* Panel de notificaciones */}
      <NotificationsPanel 
        show={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </>
  );
}