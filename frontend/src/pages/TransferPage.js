import React, { useState } from 'react';
import { initiateTransfer, confirmTransfer } from '../services/TransferService';

const TransferComponent = () => {
  const [userId, setUserId] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [transferId, setTransferId] = useState('');
  const [message, setMessage] = useState('');

  const handleInitiateTransfer = async () => {
    try {
      const response = await initiateTransfer({ userId, documentId });
      setTransferId(response.transferId);
      setMessage('Transferencia iniciada con éxito.');
    } catch (error) {
      setMessage('Error al iniciar la transferencia.');
    }
  };

  const handleConfirmTransfer = async () => {
    try {
      const response = await confirmTransfer({ userId, transferId });
      setMessage('Transferencia confirmada con éxito.');
    } catch (error) {
      setMessage('Error al confirmar la transferencia.');
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
      }}
    >
      <div
        style={{
          maxWidth: '400px',
          width: '100%',
          padding: '20px',
          border: '1px solid #ccc',
          borderRadius: '8px',
          backgroundColor: '#fff',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
      >
        <h2 style={{ textAlign: 'center', color: '#333' }}>Transferencia de Documentos</h2>
        <div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>ID de Usuario:</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Ingresa el ID de usuario"
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>ID de Documento:</label>
            <input
              type="text"
              value={documentId}
              onChange={(e) => setDocumentId(e.target.value)}
              placeholder="Ingresa el ID del documento"
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
              marginBottom: '15px',
            }}
          >
            Iniciar Transferencia
          </button>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>ID de Transferencia:</label>
            <input
              type="text"
              value={transferId}
              onChange={(e) => setTransferId(e.target.value)}
              placeholder="Ingresa el ID de transferencia"
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>
          <button
            onClick={handleConfirmTransfer}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Confirmar Transferencia
          </button>
        </div>
        {message && <p style={{ marginTop: '20px', textAlign: 'center', color: '#28a745' }}>{message}</p>}
      </div>
    </div>
  );
};

export default TransferComponent;