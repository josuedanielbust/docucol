import { useEffect, useState } from 'react';
import { Table, Container, Form, Button } from 'react-bootstrap';
import { getOperadores } from '../services/minTicAPI';

const OperadoresPage = () => {
  const [operadores, setOperadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchOperadores = async () => {
      try {
        const data = await getOperadores();
        setOperadores(data);
      } catch (err) {
        console.error('Error al cargar los operadores:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOperadores();
  }, []);

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
          <Table striped bordered hover responsive className="mt-4">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Correo</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="3" className="text-center">Cargando...</td>
                </tr>
              ) : operadores.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center">No hay operadores registrados.</td>
                </tr>) : (
                operadores.map((operador) => (
                  <tr key={operador.id}>
                    <td>{operador.id}</td>
                    <td>{operador.name}</td>
                    <td>{operador.email}</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
      </Container>
    </div>
  );
};

export default OperadoresPage;