import { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { updateUser } from '../services/userService';

const EditProfilePage = () => {
  const { user, token, login } = useAuth();
  const [formData, setFormData] = useState({
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    address: user.address || '',
    city: user.city || '',
    department: user.department || '',
    email: user.email || '',
    password: '',
  });

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    try {
      const updated = await updateUser(user.id, formData, token);
      login(updated, token);
      setSuccess('Perfil actualizado correctamente.');
    } catch (err) {
      console.error(err);
      setError('Error al actualizar el perfil.');
    }
  };

  return (
    <Container className="mt-5" style={{ maxWidth: '600px' }}>
      <h2>Editar Perfil</h2>
      <Form onSubmit={handleSubmit}>
        {['first_name', 'last_name', 'address', 'city', 'department', 'email', 'password'].map((field) => (
          <Form.Group key={field} className="mb-3">
            <Form.Label>{field.replace('_', ' ').toUpperCase()}</Form.Label>
            <Form.Control
              type={field === 'password' ? 'password' : 'text'}
              name={field}
              value={formData[field]}
              onChange={handleChange}
              required={field !== 'password'}
            />
          </Form.Group>
        ))}

        <Button type="submit" variant="primary">Guardar cambios</Button>

        {success && <Alert variant="success" className="mt-3">{success}</Alert>}
        {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
      </Form>
    </Container>
  );
};

export default EditProfilePage;