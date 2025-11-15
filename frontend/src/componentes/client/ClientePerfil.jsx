// client/client/ClientePerfil.jsx
import { useState } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Form, 
  Button, 
  Badge,
  Modal,
  Alert,
  Tabs,
  Tab
} from 'react-bootstrap';
import { 
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  Shield,
  Key,
  Bell,
  CreditCard,
  Star,
  CheckCircle,
  Edit3,
  Save,
  X
} from 'lucide-react';
import "./Footer";
import "../../assets/estilos/ClienteStile.css";
export default function ClientePerfil() {
  const [activeTab, setActiveTab] = useState('personal');
  const [editMode, setEditMode] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  // Datos del perfil del usuario
  const [profileData, setProfileData] = useState({
    personalInfo: {
      firstName: 'María',
      lastName: 'González',
      email: 'maria.gonzalez@email.com',
      phone: '+57 300 123 4567',
      address: 'Carrera 15 # 88-64, Bogotá',
      birthDate: '1990-05-15'
    },
    preferences: {
      emailNotifications: true,
      reservationReminders: true,
      promotions: false,
      smsNotifications: true,
      newsletter: true
    },
    security: {
      twoFactorEnabled: false,
      lastPasswordChange: '2024-01-01'
    },
    membership: {
      level: 'premium',
      since: '2023-06-01',
      benefits: ['Descuentos exclusivos', 'Reservas prioritarias', 'Soporte premium']
    }
  });

  // Estados para formularios
  const [personalForm, setPersonalForm] = useState(profileData.personalInfo);
  const [preferencesForm, setPreferencesForm] = useState(profileData.preferences);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handlePersonalInfoChange = (field, value) => {
    setPersonalForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreferenceChange = (preference, value) => {
    setPreferencesForm(prev => ({
      ...prev,
      [preference]: value
    }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const savePersonalInfo = () => {
    setProfileData(prev => ({
      ...prev,
      personalInfo: personalForm
    }));
    setEditMode(false);
    showSuccessMessage();
  };

  const savePreferences = () => {
    setProfileData(prev => ({
      ...prev,
      preferences: preferencesForm
    }));
    showSuccessMessage();
  };

  const changePassword = () => {
    // Aquí iría la lógica para cambiar la contraseña
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    
    setShowChangePassword(false);
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    showSuccessMessage('Contraseña actualizada exitosamente');
  };

  const showSuccessMessage = (message = 'Cambios guardados exitosamente') => {
    setShowSuccessAlert(true);
    setTimeout(() => setShowSuccessAlert(false), 3000);
  };

  const getMembershipBadge = (level) => {
    switch (level) {
      case 'premium':
        return { variant: 'warning', label: 'Premium', icon: '⭐' };
      case 'gold':
        return { variant: 'warning', label: 'Gold', icon: '🥇' };
      case 'silver':
        return { variant: 'secondary', label: 'Silver', icon: '🥈' };
      default:
        return { variant: 'primary', label: 'Básico', icon: '👤' };
    }
  };

  const membershipBadge = getMembershipBadge(profileData.membership.level);

  return (
    <Container fluid>
      {/* Alertas de éxito */}
      {showSuccessAlert && (
        <Alert variant="success" className="d-flex align-items-center">
          <CheckCircle size={20} className="me-2" />
          Cambios guardados exitosamente
        </Alert>
      )}

      {/* Header del Perfil */}
      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <Row className="align-items-center">
                <Col md="auto" className="text-center">
                  <div className="position-relative">
                    <div 
                      className="bg-primary rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                      style={{ width: '120px', height: '120px' }}
                    >
                      <User size={48} className="text-white" />
                    </div>
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      className="position-absolute bottom-0 end-0 rounded-circle"
                      style={{ width: '40px', height: '40px' }}
                    >
                      <Camera size={16} />
                    </Button>
                  </div>
                </Col>
                
                <Col>
                  <div className="d-flex align-items-center mb-2">
                    <h2 className="fw-bold mb-0 me-3">
                      {profileData.personalInfo.firstName} {profileData.personalInfo.lastName}
                    </h2>
                    <Badge bg={membershipBadge.variant} className="fs-6">
                      {membershipBadge.icon} {membershipBadge.label}
                    </Badge>
                  </div>
                  
                  <div className="mb-3">
                    <div className="d-flex align-items-center mb-1">
                      <Mail size={18} className="text-muted me-2" />
                      <span>{profileData.personalInfo.email}</span>
                    </div>
                    <div className="d-flex align-items-center mb-1">
                      <Phone size={18} className="text-muted me-2" />
                      <span>{profileData.personalInfo.phone}</span>
                    </div>
                    <div className="d-flex align-items-center">
                      <MapPin size={18} className="text-muted me-2" />
                      <span>{profileData.personalInfo.address}</span>
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    <Badge bg="success" className="d-flex align-items-center">
                      <CheckCircle size={14} className="me-1" />
                      Verificado
                    </Badge>
                    <Badge bg="info" className="d-flex align-items-center">
                      <Star size={14} className="me-1" />
                      Miembro desde {new Date(profileData.membership.since).getFullYear()}
                    </Badge>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col lg={8}>
          {/* Tabs de Navegación */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body className="p-0">
              <Tabs
                activeKey={activeTab}
                onSelect={(tab) => setActiveTab(tab)}
                className="px-3 pt-3"
              >
                {/* Información Personal */}
                <Tab eventKey="personal" title={
                  <span className="d-flex align-items-center">
                    <User size={18} className="me-2" />
                    Información Personal
                  </span>
                }>
                  <div className="p-3">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h5 className="fw-bold mb-0">Información Personal</h5>
                      <Button
                        variant={editMode ? "outline-secondary" : "outline-primary"}
                        onClick={() => setEditMode(!editMode)}
                      >
                        {editMode ? (
                          <><X size={16} className="me-1" /> Cancelar</>
                        ) : (
                          <><Edit3 size={16} className="me-1" /> Editar</>
                        )}
                      </Button>
                    </div>

                    <Form>
                      <Row className="g-3">
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="fw-bold">Nombres</Form.Label>
                            <Form.Control
                              type="text"
                              value={personalForm.firstName}
                              onChange={(e) => handlePersonalInfoChange('firstName', e.target.value)}
                              disabled={!editMode}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="fw-bold">Apellidos</Form.Label>
                            <Form.Control
                              type="text"
                              value={personalForm.lastName}
                              onChange={(e) => handlePersonalInfoChange('lastName', e.target.value)}
                              disabled={!editMode}
                            />
                          </Form.Group>
                        </Col>
                        
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="fw-bold">Correo Electrónico</Form.Label>
                            <Form.Control
                              type="email"
                              value={personalForm.email}
                              onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                              disabled={!editMode}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="fw-bold">Teléfono</Form.Label>
                            <Form.Control
                              type="tel"
                              value={personalForm.phone}
                              onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                              disabled={!editMode}
                            />
                          </Form.Group>
                        </Col>
                        
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="fw-bold">Fecha de Nacimiento</Form.Label>
                            <Form.Control
                              type="date"
                              value={personalForm.birthDate}
                              onChange={(e) => handlePersonalInfoChange('birthDate', e.target.value)}
                              disabled={!editMode}
                            />
                          </Form.Group>
                        </Col>
                        
                        <Col md={12}>
                          <Form.Group>
                            <Form.Label className="fw-bold">Dirección</Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={3}
                              value={personalForm.address}
                              onChange={(e) => handlePersonalInfoChange('address', e.target.value)}
                              disabled={!editMode}
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      {editMode && (
                        <div className="d-flex gap-2 mt-4">
                          <Button variant="primary" onClick={savePersonalInfo}>
                            <Save size={16} className="me-1" />
                            Guardar Cambios
                          </Button>
                          <Button variant="outline-secondary" onClick={() => setEditMode(false)}>
                            Cancelar
                          </Button>
                        </div>
                      )}
                    </Form>
                  </div>
                </Tab>

                {/* Preferencias */}
                <Tab eventKey="preferences" title={
                  <span className="d-flex align-items-center">
                    <Bell size={18} className="me-2" />
                    Preferencias
                  </span>
                }>
                  <div className="p-3">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h5 className="fw-bold mb-0">Preferencias de Notificación</h5>
                      <Button variant="outline-primary" onClick={savePreferences}>
                        <Save size={16} className="me-1" />
                        Guardar Preferencias
                      </Button>
                    </div>

                    <div className="row g-3">
                      {Object.entries(preferencesForm).map(([key, value]) => (
                        <Col md={6} key={key}>
                          <Card className="border-0 bg-light h-100">
                            <Card.Body>
                              <Form.Check
                                type="switch"
                                id={`preference-${key}`}
                                label={getPreferenceLabel(key)}
                                checked={value}
                                onChange={(e) => handlePreferenceChange(key, e.target.checked)}
                                className="fw-bold"
                              />
                              <small className="text-muted">
                                {getPreferenceDescription(key)}
                              </small>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </div>
                  </div>
                </Tab>

                {/* Seguridad */}
                <Tab eventKey="security" title={
                  <span className="d-flex align-items-center">
                    <Shield size={18} className="me-2" />
                    Seguridad
                  </span>
                }>
                  <div className="p-3">
                    <h5 className="fw-bold mb-4">Configuración de Seguridad</h5>
                    
                    <Row className="g-4">
                      {/* Cambio de Contraseña */}
                      <Col md={6}>
                        <Card className="border-0 h-100">
                          <Card.Body className="text-center">
                            <div className="bg-warning rounded p-3 mx-auto mb-3" style={{ width: '60px' }}>
                              <Key className="text-white" size={24} />
                            </div>
                            <h6 className="fw-bold">Contraseña</h6>
                            <p className="text-muted small mb-3">
                              Último cambio: {new Date(profileData.security.lastPasswordChange).toLocaleDateString('es-CO')}
                            </p>
                            <Button 
                              variant="outline-primary" 
                              onClick={() => setShowChangePassword(true)}
                            >
                              Cambiar Contraseña
                            </Button>
                          </Card.Body>
                        </Card>
                      </Col>

                      {/* Autenticación de Dos Factores */}
                      <Col md={6}>
                        <Card className="border-0 h-100">
                          <Card.Body className="text-center">
                            <div className="bg-info rounded p-3 mx-auto mb-3" style={{ width: '60px' }}>
                              <Shield className="text-white" size={24} />
                            </div>
                            <h6 className="fw-bold">Autenticación de Dos Factores</h6>
                            <p className="text-muted small mb-3">
                              Añade una capa extra de seguridad a tu cuenta
                            </p>
                            <Form.Check
                              type="switch"
                              id="two-factor"
                              label="2FA Activado"
                              checked={profileData.security.twoFactorEnabled}
                              onChange={(e) => setProfileData(prev => ({
                                ...prev,
                                security: {
                                  ...prev.security,
                                  twoFactorEnabled: e.target.checked
                                }
                              }))}
                              className="justify-content-center"
                            />
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </div>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          {/* Panel de Membresía */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body>
              <div className="text-center mb-4">
                <div className="bg-warning rounded p-3 mx-auto mb-3" style={{ width: '80px' }}>
                  <Star className="text-white" size={32} />
                </div>
                <h4 className="fw-bold">Membresía Premium</h4>
                <Badge bg="warning" className="fs-6 mb-2">
                  ⭐ Plan Activo
                </Badge>
                <p className="text-muted">
                  Miembro desde {new Date(profileData.membership.since).toLocaleDateString('es-CO')}
                </p>
              </div>

              <h6 className="fw-bold mb-3">Beneficios Incluidos:</h6>
              <div className="mb-4">
                {profileData.membership.benefits.map((benefit, index) => (
                  <div key={index} className="d-flex align-items-center mb-2">
                    <CheckCircle size={16} className="text-success me-2" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>

              <Button variant="outline-warning" className="w-100">
                Gestionar Membresía
              </Button>
            </Card.Body>
          </Card>

          {/* Métodos de Pago */}
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">Métodos de Pago</h5>
                <Button variant="outline-primary" size="sm">
                  <CreditCard size={16} className="me-1" />
                  Agregar
                </Button>
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center p-3 border rounded mb-2">
                  <div className="d-flex align-items-center">
                    <div className="bg-primary rounded p-2 me-3">
                      <CreditCard size={20} className="text-white" />
                    </div>
                    <div>
                      <div className="fw-bold">Visa terminada en 4321</div>
                      <small className="text-muted">Expira 12/2025</small>
                    </div>
                  </div>
                  <Badge bg="success">Predeterminado</Badge>
                </div>

                <div className="d-flex justify-content-between align-items-center p-3 border rounded">
                  <div className="d-flex align-items-center">
                    <div className="bg-danger rounded p-2 me-3">
                      <CreditCard size={20} className="text-white" />
                    </div>
                    <div>
                      <div className="fw-bold">Mastercard terminada en 8765</div>
                      <small className="text-muted">Expira 08/2024</small>
                    </div>
                  </div>
                  <Button variant="outline-secondary" size="sm">
                    Predeterminado
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal para Cambiar Contraseña */}
      <Modal show={showChangePassword} onHide={() => setShowChangePassword(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">
            <Key size={20} className="me-2" />
            Cambiar Contraseña
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Contraseña Actual</Form.Label>
              <Form.Control
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                placeholder="Ingresa tu contraseña actual"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Nueva Contraseña</Form.Label>
              <Form.Control
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                placeholder="Ingresa tu nueva contraseña"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Confirmar Nueva Contraseña</Form.Label>
              <Form.Control
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                placeholder="Confirma tu nueva contraseña"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowChangePassword(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={changePassword}>
            Cambiar Contraseña
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

// Funciones auxiliares
function getPreferenceLabel(key) {
  const labels = {
    emailNotifications: 'Notificaciones por Email',
    reservationReminders: 'Recordatorios de Reserva',
    promotions: 'Ofertas y Promociones',
    smsNotifications: 'Notificaciones por SMS',
    newsletter: 'Boletín Informativo'
  };
  return labels[key] || key;
}

function getPreferenceDescription(key) {
  const descriptions = {
    emailNotifications: 'Recibe notificaciones importantes por correo electrónico',
    reservationReminders: 'Recuerda tus reservas con notificaciones previas',
    promotions: 'Descubre ofertas exclusivas y promociones especiales',
    smsNotifications: 'Mantente informado con notificaciones por mensaje de texto',
    newsletter: 'Recibe novedades y consejos sobre el cuidado de tu ropa'
  };
  return descriptions[key] || '';
}