import { useEffect, useState } from 'react';
import { getOperadorPorCorreo } from '../services/minTicAPI';
import { useAuth } from '../contexts/AuthContext';
import { Spinner, Alert } from 'react-bootstrap';

const UserOperadorInfo = () => {
  const { user } = useAuth();
  const [operador, setOperador] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.email) {
      getOperadorPorCorreo(user.email).then((op) => {
        setOperador(op);
        setLoading(false);
      });
    }
  }, [user]);

  if (!user) return null;

  return (
    <div className="mt-3">
      {loading ? (
        <Spinner animation="border" size="sm" />
      ) : operador ? (
        <Alert variant="info">
          📡 <strong>Operador actual:</strong> {operador}
        </Alert>
      ) : (
        <Alert variant="warning">No se pudo consultar el operador.</Alert>
      )}
    </div>
  );
};

export default UserOperadorInfo;