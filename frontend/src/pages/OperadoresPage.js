import { useEffect, useState } from 'react';
import { Table, Container, Form, Button } from 'react-bootstrap';
import TransferPage from './TransferPage';

const OperadoresPage = () => {
  const [operadores, setOperadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [currentPage, setCurrentPage] = useState('operadores'); // Controla la página actual
  const [selectedOperadorId, setSelectedOperadorId] = useState(null); // ID del operador seleccionado

  useEffect(() => {
    // Cargar datos de ejemplo directamente
    const fetchOperadores = () => {
      setOperadores([
        { id: 1, name: 'Operador Ejemplo 1', email: 'ejemplo1@correo.com' },
        { id: 2, name: 'Operador Ejemplo 2', email: 'ejemplo2@correo.com' },
      ]);
      setLoading(false);
    };

    fetchOperadores();
  }, []);

  const handleTransfer = (operadorId) => {
    setSelectedOperadorId(operadorId); // Guarda el operador seleccionado
    setCurrentPage('transfer'); // Cambia a la página de transferencia
  };

  if (currentPage === 'transfer') {
    return <TransferPage operadorId={selectedOperadorId} />;
  }

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
              <th>Correo</th>
              <th>Cambiar Operador</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="text-center">Cargando...</td>
              </tr>
            ) : operadores.map((operador) => (
              <tr key={operador.id}>
                <td>{operador.id}</td>
                <td>{operador.name}</td>
                <td>{operador.email}</td>
                <td>
                  <Button
                    variant="success"
                    onClick={() => handleTransfer(operador.id)}>
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