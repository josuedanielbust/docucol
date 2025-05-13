import { useEffect, useState } from 'react';
import { Table, Container, Form, Button } from 'react-bootstrap';
import { initiateTransfer } from '../services/TransferService'; // Importar la función de la API
import { useAuth } from '../contexts/AuthContext';

const OperadoresPage = () => {
  const { user } = useAuth();
  const [operadores, setOperadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Cargar datos de ejemplo directamente
    const fetchOperadores = async () => {
      // Fetch operators from the API
      try {
        const response = await fetch('http://localhost/interop/gov-api/operators');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setOperadores(data.operators);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching operators:", error);
        // Fallback to example data if API call fails
        setLoading(false);
      }
    };

    fetchOperadores();
  }, []);

  const processTransfer = async (operadorId) => {
    try {
     const confirm = window.confirm(`¿Estás seguro de que deseas transferir al operador con ID ${operadorId}?`);
        if (!confirm) {
          return; // Si el usuario cancela, no se realiza la transferencia
        }

      const payload = { userId: user.id, operatorId: operadorId };
      await initiateTransfer(payload); // Llamada a la API
      setMessage(`Transferencia iniciada con éxito al operador ${operadorId}.`);
      setTimeout(() => {setMessage(''); }, 3000);
    } catch (error) {
      setMessage('Error al iniciar la transferencia.');
      setTimeout(() => {setMessage(''); }, 3000);

    }
  };

  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '20px' }}>
      <Container className="mt-5">
        <h2 className="text-center mb-4" style={{ color: '#007bff' }}>Lista de Operadores</h2>
        <Form className="mb-4">
          <Form.Group controlId="search" className="mb-3">
            <Form.Label>Buscar Operador</Form.Label>
            <Form.Control
              type="text"
              placeholder="Escribe el nombre o correo"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ backgroundColor: '#ffffff', borderRadius: '4px' }}
            />
          </Form.Group>
          <Button variant="primary" type="submit">Buscar</Button>
        </Form>
        {message && <div className="alert alert-info">{message}</div>}
        <Table striped bordered hover responsive className="mt-4">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Cambiar Operador</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="text-center">Cargando...</td>
              </tr>
            ) : operadores.map((operador) => (
              <tr key={operador._id}>
                <td>{operador._id}</td>
                <td>{operador.operatorName}</td>
                <td>
                  <Button
                    variant="success"
                    onClick={() => processTransfer(operador._id.toString())}>
                    Transferencia
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>
    </div>
  );
};

export default OperadoresPage;