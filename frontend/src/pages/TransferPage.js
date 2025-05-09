import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { initiateTransfer, confirmTransfer } from '../services/TransferService';

const TransferPage = () => {
  const [userId, setUserId] = useState('');
  const [transferId, setTransferId] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' o 'error'
  const [showModal, setShowModal] = useState(false); // Controla la visibilidad del modal

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000);
  };

  const handleInitiateTransfer = async () => {
    try {
      if (!userId) {
        showMessage('Por favor, ingresa un ID de usuario.', 'error');
        return;
      }

      // Transferir usuario con todos sus documentos
      const payload = { userId, includeDocuments: true };
      const response = await initiateTransfer(payload);
      setTransferId(response.transferId); // Almacena el ID de Transferencia generado
      showMessage('Transferencia iniciada con éxito.', 'success');
      setShowModal(true); // Muestra el modal
    } catch (error) {
      showMessage('Error al iniciar la transferencia de usuario y documentos.', 'error');
    }
  };

  const handleConfirmTransfer = async () => {
    try {
      await confirmTransfer({ transferId });
      showMessage('Transferencia confirmada con éxito.', 'success');
      setShowModal(false); // Cierra el modal
    } catch (error) {
      showMessage('Error al confirmar la transferencia.', 'error');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f0f2f5',
      }}>
      <div
        style={{
          maxWidth: '400px',
          width: '100%',
          padding: '20px',
          border: '1px solid #ccc',
          borderRadius: '8px',
          backgroundColor: '#fff',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}>
        <h2 className="text-center mb-4" style={{ color: '#007bff' }}>Transferencia de Operador</h2>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>ID de Usuario:</label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Ingresa el ID del usuario"
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>
        <button
          onClick={handleInitiateTransfer}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}>
          Iniciar Transferencia
        </button>
        {message && (
          <p
            style={{
              marginTop: '20px',
              textAlign: 'center',
              color: messageType === 'success' ? '#28a745' : '#dc3545',
            }}>
            {message}
          </p>
        )}
      </div>

      {/* Modal para confirmar transferencia */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Transferencia</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>¿Deseas confirmar la transferencia con el ID: <strong>{transferId}</strong>?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleConfirmTransfer}>
            Confirmar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TransferPage;