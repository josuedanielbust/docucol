import { Navbar, Nav, Container, Dropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { getOperadorPorCorreo } from '../services/minTicAPI';
import { FaUserCircle } from 'react-icons/fa';

const NavigationBar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [operador, setOperador] = useState('');

  useEffect(() => {
    if (user?.email) {
      getOperadorPorCorreo(user.email).then((op) => setOperador(op));
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">DocuCol</Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse>
          <Nav className="ms-auto">
            {isAuthenticated ? (
              <>
                <Nav.Link as={Link} to="/my-documents">Mis Documentos</Nav.Link>
                <Nav.Link as={Link} to="/upload">Subir</Nav.Link>

                <Dropdown align="end">
                  <Dropdown.Toggle variant="secondary" id="dropdown-user" className="d-flex align-items-center">
                    <FaUserCircle size={20} className="me-1" />
                    <span className="d-none d-md-inline">{user.first_name}</span>
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    <Dropdown.Header>
                      <strong>{user.first_name} {user.last_name}</strong><br />
                      <small>{user.email}</small><br />
                      <small>Operador: {operador || 'Cargando...'}</small>
                    </Dropdown.Header>
                    <Dropdown.Divider />
                    <Dropdown.Item as={Link} to="/edit-profile">
                      Mi perfil
                    </Dropdown.Item>
                    <Dropdown.Item onClick={handleLogout}>
                      Cerrar sesión
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/signin">Iniciar Sesión</Nav.Link>
                <Nav.Link as={Link} to="/signup">Registrarse</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;