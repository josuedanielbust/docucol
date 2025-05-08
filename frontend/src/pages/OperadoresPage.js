import { useEffect, useState } from 'react';
import { Table, Container, Alert, Spinner } from 'react-bootstrap';
import { getOperadores } from '../services/minTicAPI';

const OperadoresPage = () => {
  const [operadores, setOperadores] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOperadores = async () => {
      try {
        const data = await getOperadores();
        setOperadores(data);
      } catch (err) {
        setError('Error al cargar los operadores.');
      } finally {
        setLoading(false);
      }
    };

    fetchOperadores();
  }, []);

  return (
    <Container className="mt-5">
      <h2 className="text-center">Lista de Operadores</h2>
      <p className="text-center text-muted">Consulta los operadores registrados en el sistema.</p>
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : operadores.length === 0 ? (
        <Alert variant="info">No hay operadores registrados.</Alert>
      ) : (
        <Table striped bordered hover responsive className="mt-4">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Correo</th>
            </tr>
          </thead>
          <tbody>
            {operadores.map((operador) => (
              <tr key={operador.id}>
                <td>{operador.id}</td>
                <td>{operador.name}</td>
                <td>{operador.email}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default OperadoresPage;
