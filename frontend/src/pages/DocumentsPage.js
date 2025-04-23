import { useEffect, useState } from 'react';
import { Table, Container, Spinner, Alert, Button } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { fetchUserDocuments, deleteDocument } from '../services/documentService';

const formatSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

// Extraer solo el nombre del archivo desde la ruta completa
const getFileName = (filePath) => {
  return filePath.split('/').pop();
};

const DocumentsPage = () => {
  const { token, user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const data = await fetchUserDocuments(user.id, token);
        setDocuments(data);
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

  const handleDelete = async (documentId) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este documento?")) return;
  
    try {
      await deleteDocument(documentId, token);
      setDocuments((prevDocs) => prevDocs.filter((doc) => doc.id !== documentId));
    } catch (err) {
      console.error("Error eliminando documento:", err);
      alert("Ocurrió un error al eliminar el documento.");
    }
  };
  

  return (
    <Container className="mt-5">
      <h2>Mis Documentos</h2>

      {loading && <Spinner animation="border" />}

      {error && <Alert variant="danger">{error}</Alert>}

      {!loading && documents.length === 0 && (
        <Alert variant="info">Aún no has subido documentos.</Alert>
      )}

      {!loading && documents.length > 0 && (
        <Table striped bordered hover responsive className="mt-4">
          <thead>
            <tr>
              <th>Título</th>
              <th>Tipo</th>
              <th>Tamaño</th>
              <th>Subido el</th>
              <th>Archivo</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id}>
                <td>{doc.title}</td>
                <td>{doc.mimeType}</td>
                <td>{formatSize(doc.fileSize)}</td>
                <td>{new Date(doc.createdAt).toLocaleString()}</td>
                {/* <td>
                  <em>Descarga no disponible</em>
                  <Button
                    size="sm"
                    variant="outline-primary"
                    href={`http://localhost:3000/uploads/${getFileName(doc.filePath)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ver / Descargar
                  </Button>
                </td> */}
                <td className="d-flex gap-2">
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
  );
};

export default DocumentsPage;
