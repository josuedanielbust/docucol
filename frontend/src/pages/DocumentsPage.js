import React, { useEffect, useState } from 'react';
import { Container, Form, Button, Alert, Spinner, Table, Card, Tabs, Tab } from 'react-bootstrap';
import { FaUpload, FaTrash, FaDownload, FaCheckCircle } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { fetchUserDocuments, deleteDocument, uploadDocument, requestAuthentication } from '../services/documentService';

const formatSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const DocumentManagerPage = () => {
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState('list');
  const [documents, setDocuments] = useState([]);
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState('success');
  const [loading, setLoading] = useState(false);

  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');

  const loadDocuments = async () => {
    setMessage('');
    setLoading(true);
    try {
      const data = await fetchUserDocuments(user.id, token);
      setDocuments(data);
      setFilteredDocs(data);
    } catch (err) {
      console.error(err);
      setMessage('Error al cargar documentos.');
      setVariant('danger');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 4000)
    }
  };

  useEffect(() => {
    if (user && token) loadDocuments();
  }, [user, token]);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setFilteredDocs(documents.filter((doc) => doc.title.toLowerCase().includes(term)));
  };

  // useEffect(() => {
  //   const term = searchTerm.toLowerCase();
  //   setFilteredDocs(
  //     documents.filter((doc) => doc.title.toLowerCase().includes(term))
  //   );
  // }, [searchTerm, documents]);

  const handleUpload = async () => {
    if (!file || !title) {
      setMessage('Completa todos los campos para subir un documento.');
      setVariant('danger');
      return;
    }
    setMessage('');
    setLoading(true);
    try {
      await uploadDocument(file, title, token, user.id);
      setMessage('Documento subido con éxito.');
      setVariant('success');
      setFile(null);
      setTitle('');
      loadDocuments();
    } catch (err) {
      console.error(err);
      setMessage('Error al subir el documento.');
      setVariant('danger');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 4000)
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este documento?')) return;
    setMessage('');
    setLoading(true);
    try {
      await deleteDocument(id, token);
      const updated = documents.filter((doc) => doc.id !== id);
      setDocuments(updated);
      setFilteredDocs((prev) => prev.filter((doc) => doc.id !== id));
      setMessage('Documento eliminado con éxito.');
      setVariant('success');
    } catch (err) {
      console.error(err);
      setMessage('Error al eliminar el documento.');
      setVariant('danger');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 4000)
    }
  };

  const handleRequestAuthentication = async (doc) => {
    setMessage('');
    setLoading(true);
    try {
      await requestAuthentication(doc, token);
      setMessage('Solicitud de autenticación enviada con éxito.');
      setVariant('success');
    } catch (err) {
      console.error(err);
      setMessage('Error al solicitar autenticación.');
      setVariant('danger');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 4000)
    }
  };

  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '20px' }}>
      <Container className='="my-4'>
        <Card className='shadow-sm'>
          <Card.Body>
            <h2 className="text-center mb-4 text-primary">Gestión de Documentos</h2>
            {message && <Alert variant={variant}>{message}</Alert>}

            <Tabs activeKey={activeTab}
              onSelect={(k) => {
                setActiveTab(k);
                if (k === 'list') loadDocuments();
              }}
              className="mb-4"
              fill
            >
              <Tab eventKey="list" title="Mis Documentos">
                <Form className="mb-3">
                  <Form.Control
                    type="text"
                    placeholder="Buscar por título"
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </Form>

                {loading ? (
                  <div className="text-center">
                    <Spinner animation="border" />
                  </div>
                ) : filteredDocs.length === 0 ? (
                  <Alert variant="info">No se encontraron documentos.</Alert>
                ) : (
                  <Table striped bordered hover responsive className="table-sm shadow-sm rounded align-middle">
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
                      {filteredDocs.map((doc) => (
                        <tr key={doc.id}>
                          <td>{doc.title}</td>
                          <td>{doc.mimeType}</td>
                          <td>{formatSize(doc.fileSize)}</td>
                          <td>{new Date(doc.createdAt).toLocaleString()}</td>
                          <td className="d-flex gap-2 justify-content-center">
                            <Button size="sm" variant="outline-secondary" disabled>
                              <FaDownload className="me-1" /> Descargar
                            </Button>
                            <Button size="sm" variant="outline-success" onClick={() => handleRequestAuthentication(doc)}>
                              <FaCheckCircle className="me-1" /> Solicitar autenticación
                            </Button>
                            <Button size="sm" variant="outline-danger" onClick={() => handleDelete(doc.id)}>
                              <FaTrash className="me-1" /> Eliminar
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Tab>

              <Tab eventKey="upload" title="Subir Documento">
                <Form className="p-3 bg-light rounded shadow-sm">
                  <Form.Group className="mb-3">
                    <Form.Label>Título del documento</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Ej: Diploma, Certificado, etc."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Seleccionar archivo</Form.Label>
                    <Form.Control type="file" onChange={(e) => setFile(e.target.files[0])} />
                  </Form.Group>
                  <Button variant="primary" onClick={handleUpload} disabled={loading}>
                    {loading ? <Spinner animation="border" size="sm" className="me-2" /> : <FaUpload className="me-2" />}
                    Subir Documento
                  </Button>
                </Form>
              </Tab>
            </Tabs>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default DocumentManagerPage;