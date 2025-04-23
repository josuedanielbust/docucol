import React, { useState } from 'react';
import axios from 'axios';
import { Container, Form, Button, Alert } from 'react-bootstrap';

const UploadFilePage = () => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState('success');

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);

    try {
      const res = await axios.post('http://localhost:3000/api/documents', formData);
      setVariant('success');
      setMessage('Documento subido con éxito.');
    } catch (err) {
      setVariant('danger');
      setMessage('Error al subir el documento.');
    }
  };

  return (
    <Container className="mt-5">
      <h2>Subir Documento</h2>
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
          Subir Documento
        </Button>
      </Form>

      {message && (
        <Alert variant={variant} className="mt-3">
          {message}
        </Alert>
      )}
    </Container>
  );
};

export default UploadFilePage;