import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Form, Button, Alert, Spinner, Card, Row, Col } from 'react-bootstrap';
import { FaUpload, FaTrash } from 'react-icons/fa';

const UploadFilePage = () => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [documents, setDocuments] = useState([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState('');
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState('success');
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('upload'); // 'upload' o 'delete'

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost/documents');
        setDocuments(response.data);
      } catch (err) {
        console.error('Error al cargar documentos:', err);
        setMessage('Error al cargar la lista de documentos.');
        setVariant('danger');
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);

    try {
      await axios.post('http://localhost/documents', formData);
      setVariant('success');
      setMessage('Documento subido con éxito.');
      setFile(null);
      setTitle('');
    } catch (err) {
      setVariant('danger');
      setMessage('Error al subir el documento.');
    }
  };

  const handleDelete = async () => {
    if (!selectedDocumentId) {
      setVariant('danger');
      setMessage('Por favor, selecciona un documento para eliminar.');
      return;
    }

    try {
      await axios.delete('http://localhost/documents/${selectedDocumentId}');
      setDocuments((prevDocs) =>
        prevDocs.filter((doc) => doc.id !== selectedDocumentId)
      );
      setVariant('success');
      setMessage('Documento eliminado con éxito.');
    } catch (err) {
      setVariant('danger');
      setMessage('Error al eliminar el documento.');
    }
  };

  return (
    <Container className="mt-5">
      <h2 className="text-center mb-4">Gestión de Documentos</h2>

      {message && (
        <Alert variant={variant} className="mt-3">
          {message}
        </Alert>
      )}

      <div className="d-flex justify-content-center mb-4">
        <Button
          variant={viewMode === 'upload' ? 'primary' : 'outline-primary'}
          className="me-2"
          onClick={() => setViewMode('upload')}
        >
          Subir Archivo
        </Button>
        <Button
          variant={viewMode === 'delete' ? 'danger' : 'outline-danger'}
          onClick={() => setViewMode('delete')}
        >
          Eliminar Archivo
        </Button>
      </div>

      {viewMode === 'upload' && (
        <Card className="mb-4">
          <Card.Body>
            <Card.Title>Subir Documento</Card.Title>
            <Form>
              <Form.Group className="mb-3" controlId="formTitle">
                <Form.Label>Título del documento</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ej: Diploma, Cédula, Certificado"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formFile">
                <Form.Label>Selecciona el archivo</Form.Label>
                <Form.Control
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </Form.Group>

              <Button variant="primary" onClick={handleUpload}>
                <FaUpload className="me-2" />
                Subir Documento
              </Button>
            </Form>
          </Card.Body>
        </Card>
      )}

      {viewMode === 'delete' && (
        <Card className="mb-4">
          <Card.Body>
            <Card.Title>Eliminar Documento</Card.Title>
            {loading ? (
              <Spinner animation="border" />
            ) : (
              <Form>
                <Form.Group className="mb-3" controlId="formDocumentSelect">
                  <Form.Label>Selecciona un documento</Form.Label>
                  <Form.Control
                    as="select"
                    value={selectedDocumentId}
                    onChange={(e) => setSelectedDocumentId(e.target.value)}
                  >
                    <option value="">-- Selecciona un documento --</option>
                    {documents.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.title}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>

                <Button variant="danger" onClick={handleDelete}>
                  <FaTrash className="me-2" />
                  Eliminar Documento
                </Button>
              </Form>
            )}
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default UploadFilePage;