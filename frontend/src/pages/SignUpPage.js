import { useState } from 'react';
import { Container, Form, Button, Alert, Row, Col, Card } from 'react-bootstrap';
import { FaUser, FaEnvelope, FaLock, FaMapMarkerAlt, FaCity, FaIdCard } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    id: '',
    first_name: '',
    last_name: '',
    address: '',
    city: '',
    department: '',
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await axios.post('http://localhost:3000/auth/signup', formData);
      setSuccess('Usuario registrado con éxito. Serás redirigido al login.');
      setTimeout(() => navigate('/signin'), 2000);
    } catch (err) {
      console.error(err);
      setError('Error al registrar el usuario.');
    }
  };

  return (
    <Container className="mt-5" style={{ maxWidth: '700px' }}>
      <Card className="shadow-lg p-4">
        <Card.Body>
          <h2 className="text-center mb-4" style={{ color: '#007bff' }}>Registro de Usuario</h2>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaIdCard className="me-2" />
                    Identificación
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="id"
                    placeholder="Ejemplo: 12345678"
                    value={formData.id}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaEnvelope className="me-2" />
                    Correo Electrónico
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="correo@ejemplo.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaUser className="me-2" />
                    Nombre
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="first_name"
                    placeholder="Ejemplo: Juan"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaUser className="me-2" />
                    Apellido
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="last_name"
                    placeholder="Ejemplo: Pérez"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaMapMarkerAlt className="me-2" />
                    Dirección
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    placeholder="Ejemplo: Calle 123"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaCity className="me-2" />
                    Ciudad
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="city"
                    placeholder="Ejemplo: Bogotá"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaMapMarkerAlt className="me-2" />
                    Departamento
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="department"
                    placeholder="Ejemplo: Cundinamarca"
                    value={formData.department}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaLock className="me-2" />
                    Contraseña
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Button type="submit" variant="primary" className="w-100">
              Registrar
            </Button>

            {success && <Alert variant="success" className="mt-3">{success}</Alert>}
            {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default RegisterPage;