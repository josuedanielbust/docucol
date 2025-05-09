import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Container, Alert, Card, Row, Col, Spinner } from 'react-bootstrap';
import { FaSignInAlt, FaEnvelope, FaLock } from 'react-icons/fa';
import axios from 'axios';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [forgotPasswordMsg, setForgotPasswordMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost/auth/signin', {
        email,
        password,
      });

      const { token, user } = response.data;

      login(user, token);
      navigate('/my-documents');
    } catch (err) {
      setErrorMsg('Credenciales inválidas o error en el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setForgotPasswordMsg('');
    setErrorMsg('');

    if (!email) {
      setErrorMsg('Por favor, ingresa tu correo electrónico para restablecer la contraseña.');
      return;
    }

    setLoading(true);
    try {
      await axios.post('http://localhost/gov-api/documents/authenticate', { email });
      setForgotPasswordMsg('Se ha enviado un correo para restablecer tu contraseña.');
    } catch (err) {
      setErrorMsg('Error al solicitar el restablecimiento de contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5" style={{ maxWidth: '500px' }}>
      <Card>
        <Card.Body>
          <h2 className="text-center mb-4">
            <FaSignInAlt className="me-2" />
            Iniciar Sesión
          </h2>
          <p className="text-center text-muted">
            Ingresa tus credenciales para acceder a tu cuenta.
          </p>
          {loading ? (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <Form onSubmit={handleLogin}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <FaEnvelope className="me-2" />
                  Correo electrónico
                </Form.Label>
                <Form.Control
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  isInvalid={!!errorMsg && !email}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Por favor, ingresa un correo válido.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>
                  <FaLock className="me-2" />
                  Contraseña
                </Form.Label>
                <Form.Control
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  isInvalid={!!errorMsg && !password}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Por favor, ingresa tu contraseña.
                </Form.Control.Feedback>
              </Form.Group>

              <Row className="mb-3">
                <Col>
                  <Button variant="primary" type="submit" className="w-100">
                    Iniciar Sesión
                  </Button>
                </Col>
              </Row>

              <Row>
                <Col>
                  <Button
                    variant="link"
                    className="w-100 text-decoration-none"
                    onClick={handleForgotPassword}
                  >
                    ¿Olvidaste tu contraseña?
                  </Button>
                </Col>
              </Row>

              {errorMsg && <Alert variant="danger" className="mt-3">{errorMsg}</Alert>}
              {forgotPasswordMsg && <Alert variant="success" className="mt-3">{forgotPasswordMsg}</Alert>}
            </Form>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default LoginPage;