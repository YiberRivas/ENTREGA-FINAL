import React from 'react';
import { Container, Card, Form, Button } from 'react-bootstrap';

const ClientePerfil = () => {
    // Aquí iría la lógica para cargar y actualizar el perfil del cliente
    return (
        <div className="p-4 flex-grow-1" style={{ background: "#f8f9fa" }}>
            <Container fluid>
                <h2 className="mb-4 text-primary fw-bold"><i className="fas fa-user-circle me-2"></i> Mi Perfil</h2>
                <Card className="shadow-sm">
                    <Card.Body>
                        <Card.Title className="mb-3">Información Personal</Card.Title>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Nombres</Form.Label>
                                <Form.Control type="text" placeholder="Ej: Juan" disabled /> 
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Correo Electrónico</Form.Label>
                                <Form.Control type="email" placeholder="juan.perez@ejemplo.com" />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Teléfono</Form.Label>
                                <Form.Control type="text" placeholder="300 123 4567" />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Dirección Principal</Form.Label>
                                <Form.Control as="textarea" rows={2} placeholder="Calle 10 # 20-30" />
                            </Form.Group>
                            <Button variant="primary"><i className="fas fa-save me-2"></i> Guardar Cambios</Button>
                        </Form>
                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
};

export default ClientePerfil;