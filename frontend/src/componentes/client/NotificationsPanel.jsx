import React from 'react';
import { Card, ListGroup, Button } from 'react-bootstrap';

const NotificationsPanel = ({ show, onClose }) => {
  if (!show) return null;

  const notifications = [
    {
      id: 1,
      icon: 'fa-calendar-check',
      message: 'Tu reserva en Centro Comercial Santafé comienza en 30 minutos',
      time: 'Hace 5 min',
      unread: true
    },
    {
      id: 2,
      icon: 'fa-star',
      message: '¡Califica tu última experiencia con la lavadora Samsung EcoBubble!',
      time: 'Ayer',
      unread: true
    },
    {
      id: 3,
      icon: 'fa-tag',
      message: 'Nuevo descuento disponible para tu próxima reserva',
      time: 'Hace 2 días',
      unread: false
    }
  ];

  return (
    <Card className="notifications-panel">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Notificaciones</h5>
        <Button variant="link" className="p-0 text-decoration-none" onClick={onClose}>
          <i className="fas fa-times"></i>
        </Button>
      </Card.Header>
      <ListGroup variant="flush">
        {notifications.map(notification => (
          <ListGroup.Item 
            key={notification.id}
            className={`notification-item ${notification.unread ? 'unread' : ''}`}
          >
            <div className="d-flex gap-3">
              <div className="notification-icon">
                <i className={`fas ${notification.icon}`}></i>
              </div>
              <div className="notification-content">
                <p className="mb-1">{notification.message}</p>
                <small className="text-muted">{notification.time}</small>
              </div>
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>
      <Card.Footer className="text-center">
        <Button variant="link" className="text-decoration-none">
          Marcar todas como leídas
        </Button>
      </Card.Footer>
    </Card>
  );
};

export default NotificationsPanel;