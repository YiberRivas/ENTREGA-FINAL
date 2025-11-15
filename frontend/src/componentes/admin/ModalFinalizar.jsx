import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

export default function ModalFinalizar({ show, onClose, onSubmit, agendamiento }) {
  const [calificacion, setCalificacion] = useState(5);
  const [observaciones, setObservaciones] = useState("");
  const [formaPago, setFormaPago] = useState(0);

  if (!agendamiento) return null;

  const handleSubmit = () => {
    onSubmit({
      agendamiento_id: agendamiento.id_agendamiento,
      calificacion: Number(calificacion),
      observaciones,
      forma_pago_id: formaPago === 0 ? null : Number(formaPago),
    });
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Finalizar Servicio</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p><b>Cliente:</b> {agendamiento.cliente}</p>
        <p><b>Servicio:</b> {agendamiento.servicio}</p>
        <p><b>Fecha:</b> {agendamiento.fecha}</p>

        <Form.Group className="mb-3">
          <Form.Label>Calificación</Form.Label>
          <Form.Select
            value={calificacion}
            onChange={(e) => setCalificacion(e.target.value)}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>{n} ⭐</option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Observaciones</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Observaciones del servicio..."
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Forma de Pago</Form.Label>
          <Form.Select
            value={formaPago}
            onChange={(e) => setFormaPago(Number(e.target.value))}
          >
            <option value={0}>No pagar ahora</option>
            <option value={1}>Efectivo</option>
            <option value={2}>Transferencia</option>
            <option value={3}>Nequi</option>
            <option value={4}>Tarjeta</option>
          </Form.Select>
        </Form.Group>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="success" onClick={handleSubmit}>
          Finalizar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
