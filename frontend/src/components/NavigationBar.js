import { Navbar, Nav, Container, Dropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaUserCircle, FaSignOutAlt, FaUserEdit } from 'react-icons/fa';

const NavigationBar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  // const [operador, setOperador] = useState('');

  // // Obtener información del operador
  // useEffect(() => {
  //   if (user?.email) {
  //     getOperadorPorCorreo(user.email).then((op) => setOperador(op));
  //   }
  // }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top" className="shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold">DocuCol</Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse  className="justify-content-between">
          <Nav className="me-auto">
            {isAuthenticated && (
              <>
                <Nav.Link as={Link} to="/my-documents">Mis Documentos</Nav.Link>
                <Nav.Link as={Link} to="/operadores">Operadores</Nav.Link>
              </>
            )}
          </Nav>

          <Nav>
            {isAuthenticated ? (
              <Dropdown align="end">
                <Dropdown.Toggle variant="outline-light" id="dropdown-user" className="d-flex align-items-center">
                  <FaUserCircle size={18} className="me-2" />
                  {user.first_name}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Header className="text-center">
                    <strong>{user.first_name} {user.last_name}</strong><br />
                    <small>{user.email}</small><br />
                    {/* <small>Operador: {operador || 'Cargando...'}</small> */}
                  </Dropdown.Header>
                  <Dropdown.Divider />
                  <Dropdown.Item as={Link} to="/profile">
                    <FaUserEdit className="me-2" />
                    Mi perfil
                  </Dropdown.Item>
                  <Dropdown.Item onClick={handleLogout}>
                    <FaSignOutAlt className="me-2" />
                    Cerrar Sesión
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <>
                <Nav.Link as={Link} to="/">Iniciar Sesión</Nav.Link>
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