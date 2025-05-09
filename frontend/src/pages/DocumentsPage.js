import { useEffect, useState } from 'react';
import { Table, Container, Spinner, Alert, Button, Form } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { fetchUserDocuments, deleteDocument } from '../services/documentService';

const formatSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const DocumentsPage = () => {
  const { token, user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const data = await fetchUserDocuments(user.id, token);
        setDocuments(data);
        setFilteredDocuments(data);
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar los documentos.');
      } finally {
        setLoading(false);
      }
    };

    if (user && token) {
      loadDocuments();
    }
  }, [user, token]);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setFilteredDocuments(
      documents.filter((doc) =>
        doc.title.toLowerCase().includes(term)
      )
    );
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este documento?")) return;

    try {
      await deleteDocument(documentId, token);
      setDocuments((prevDocs) => prevDocs.filter((doc) => doc.id !== documentId));
      setFilteredDocuments((prevDocs) => prevDocs.filter((doc) => doc.id !== documentId));
    } catch (err) {
      console.error("Error eliminando documento:", err);
      alert("Ocurrió un error al eliminar el documento.");
    }
  };

  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '20px' }}>
      <Container>
        <h2 className="text-center mb-4" style={{ color: '#007bff' }}>Mis Documentos</h2>

        <Form className="mb-4">
        <Form.Label>Buscar Documento</Form.Label>
          <Form.Control
            type="text"
            placeholder="Buscar por título"
            value={searchTerm}
            onChange={handleSearch}
          />
        </Form>
        <Button variant="primary" type="submit">Buscar</Button>

        {loading && (
          <Table striped bordered hover responsive className="mt-4 table-sm">
            <thead className="table-dark">
              <tr>
                <th>Título</th>
                <th>Tipo</th>
                <th>Tamaño</th>
                <th>Fecha de carga</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="5" className="text-center">
                  <Spinner animation="border" size="sm" className="me-2" />
                  Cargando documentos...
                </td>
              </tr>
            </tbody>
          </Table>
        )}

        {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

        {!loading && filteredDocuments.length === 0 && (
          <Alert variant="info" className="mt-3">No se encontraron documentos.</Alert>
        )}

        {!loading && filteredDocuments.length > 0 && (
          <Table striped bordered hover responsive className="mt-4 table-sm">
            <thead className="table-dark">
              <tr>
                <th>Título</th>
                <th>Tipo</th>
                <th>Tamaño</th>
                <th>Subido el</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map((doc) => (
                <tr key={doc.id}>
                  <td>{doc.title}</td>
                  <td>{doc.mimeType}</td>
                  <td>{formatSize(doc.fileSize)}</td>
                  <td>{new Date(doc.createdAt).toLocaleString()}</td>
                  <td className="d-flex gap-2 justify-content-center">
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      disabled
                    >
                      Descargar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => handleDelete(doc.id)}
                    >
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Container>
    </div>
  );
};

export default DocumentsPage;