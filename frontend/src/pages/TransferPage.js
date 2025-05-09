import React, { useState } from 'react';
import { initiateTransfer, confirmTransfer } from '../services/TransferService';

const TransferPage = () => {
  const [userId, setUserId] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [transferId, setTransferId] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' o 'error'
  const [activeSection, setActiveSection] = useState('document'); // 'document' o 'user'

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
      const payload = activeSection === 'document' ? { documentId } : { userId };
      const response = await initiateTransfer(payload);
      setTransferId(response.transferId);
      showMessage(`Transferencia de ${activeSection} iniciada con éxito.`, 'success');
    } catch (error) {
      showMessage(`Error al iniciar la transferencia de ${activeSection}.`, 'error');
    }
  };

  const handleConfirmTransfer = async () => {
    try {
      await confirmTransfer({ transferId });
      showMessage(`Transferencia de ${activeSection} confirmada con éxito.`, 'success');
    } catch (error) {
      showMessage(`Error al confirmar la transferencia de ${activeSection}.`, 'error');
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
        <h2 className="text-center mb-4" style={{ color: '#007bff' }}>Transferencia</h2>
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <button
            onClick={() => setActiveSection('document')}
            style={{
              marginRight: '10px',
              padding: '10px',
              backgroundColor: activeSection === 'document' ? '#007bff' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}>
            Documentos
          </button>
          <button
            onClick={() => setActiveSection('user')}
            style={{
              padding: '10px',
              backgroundColor: activeSection === 'user' ? '#007bff' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }} >
            Usuarios
          </button>
        </div>
        {activeSection === 'document' && (
          <div>
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
          </div>
        )}
        {activeSection === 'user' && (
          <div>
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
          </div>
        )}
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
          }}>
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
          }}>
          Confirmar Transferencia
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
    </div>
  );
};

export default TransferPage;