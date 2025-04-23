import { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
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
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await axios.post('http://localhost:3000/api/auth/signup', formData);
      setSuccess('Usuario registrado con éxito. Serás redirigido al login.');
      setTimeout(() => navigate('/signin'), 2000);
    } catch (err) {
      console.error(err);
      setError('Error al registrar el usuario.');
    }
  };

  return (
    <Container className="mt-5" style={{ maxWidth: '600px' }}>
      <h2>Registro de Usuario</h2>
      <Form onSubmit={handleSubmit}>
        {['id', 'first_name', 'last_name', 'address', 'city', 'department', 'email', 'password'].map((field) => (
          <Form.Group key={field} className="mb-3">
            <Form.Label>{field.replace('_', ' ').toUpperCase()}</Form.Label>
            <Form.Control
              type={field === 'password' ? 'password' : 'text'}
              name={field}
              value={formData[field]}
              onChange={handleChange}
              required
            />
          </Form.Group>
        ))}

        <Button type="submit" variant="primary">Registrar</Button>

        {success && <Alert variant="success" className="mt-3">{success}</Alert>}
        {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
      </Form>
    </Container>
  );
};

export default RegisterPage;
