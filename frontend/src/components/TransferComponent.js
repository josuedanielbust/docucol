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
      setTransferId(response.transferId); // Asume que el backend devuelve un transferId
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
    <div>
      <h2>Transferencia de Documentos</h2>
      <div>
        <label>
          ID de Usuario:
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
        </label>
      </div>
      <div>
        <label>
          ID de Documento:
          <input
            type="text"
            value={documentId}
            onChange={(e) => setDocumentId(e.target.value)}
          />
        </label>
      </div>
      <button onClick={handleInitiateTransfer}>Iniciar Transferencia</button>
      <div>
        <label>
          ID de Transferencia:
          <input
            type="text"
            value={transferId}
            onChange={(e) => setTransferId(e.target.value)}
          />
        </label>
      </div>
      <button onClick={handleConfirmTransfer}>Confirmar Transferencia</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default TransferComponent;