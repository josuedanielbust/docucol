import { useState } from 'react';
import { Container, Card, Row, Col, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { updateUser } from '../services/userService';
import { FaEdit, FaSave } from 'react-icons/fa';

const ProfilePage = () => {
  const { user, token, login } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ ...user, password: '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setSuccess('');
    setError('');
    setLoading(true);
    try {
      const dataToSend = { ...formData };
      if (!dataToSend.password) delete dataToSend.password;
      const updatedUser = await updateUser(user.id, dataToSend, token);
      login(updatedUser, token); 
      setSuccess('Perfil actualizado correctamente.');
      setEditing(false);
    } catch (err) {
      console.error(err);
      setError('Error al actualizar el perfil.');
    } finally {
      setLoading(false);
      setTimeout(() => {
        setSuccess('');
        setError('');
      }, 5000)
    }
  };

  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '20px' }}>
        <Container className="mt-5">
        <Card className="shadow-lg">
            <Card.Header className="d-flex justify-content-between align-items-center bg-primary text-white">
                <h4 className="mb-0">Mi Perfil</h4>
                {!editing && (
                    <Button variant="light" size="sm" onClick={() => setEditing(true)}>
                    <FaEdit className="me-2" /> Editar
                    </Button>
                )}
            </Card.Header>
            <Card.Body>
            {success && <Alert variant="success">{success}</Alert>}
            {error && <Alert variant="danger">{error}</Alert>}

            <Row>
                <Col md={6}>
                <Form.Group className="mb-3">
                    <Form.Label>Nombres</Form.Label>
                    <Form.Control
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    disabled={!editing}
                    />
                </Form.Group>
                </Col>
                <Col md={6}>
                <Form.Group className="mb-3">
                    <Form.Label>Apellidos</Form.Label>
                    <Form.Control
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    disabled={!editing}
                    />
                </Form.Group>
                </Col>
            </Row>

            <Row>
                <Col md={6}>
                <Form.Group className="mb-3">
                    <Form.Label>Correo</Form.Label>
                    <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!editing}
                    />
                </Form.Group>
                </Col>
                <Col md={6}>
                <Form.Group className="mb-3">
                    <Form.Label>Dirección</Form.Label>
                    <Form.Control
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={!editing}
                    />
                </Form.Group>
                </Col>
            </Row>

            <Row>
                <Col md={6}>
                <Form.Group className="mb-3">
                    <Form.Label>Ciudad</Form.Label>
                    <Form.Control
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    disabled={!editing}
                    />
                </Form.Group>
                </Col>
                <Col md={6}>
                <Form.Group className="mb-3">
                    <Form.Label>Departamento</Form.Label>
                    <Form.Control
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    disabled={!editing}
                    />
                </Form.Group>
                </Col>
            </Row>

            <Row>
                <Col md={6}>
                <p className="text-muted"><strong>Creado:</strong> {new Date(user.createdAt).toLocaleString()}</p>
                </Col>
                <Col md={6}>
                <p className="text-muted"><strong>Última actualización:</strong> {new Date(user.updatedAt).toLocaleString()}</p>
                </Col>
            </Row>

            {editing && (
                <div className="text-end">
                <Button variant="success" onClick={handleSave}>
                    <FaSave className="me-2" /> Guardar Cambios
                </Button>
                </div>
            )}
            </Card.Body>
        </Card>
        </Container>
    </div>
  );
};

export default ProfilePage;