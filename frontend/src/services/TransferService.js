import axios from 'axios';

// Función para iniciar una transferencia
export const initiateTransfer = async (initiateTransferDto) => {
  try {
    const response = await axios.post('http://localhost:3000/transfer/initiate', initiateTransferDto);
    return response.data;
  } catch (error) {
    console.error('Error al iniciar la transferencia:', error);
    throw error;
  }
};

// Función para confirmar una transferencia
export const confirmTransfer = async (confirmTransferDto) => {
  try {
    const response = await axios.post('http://localhost:3000/transfer/confirm', confirmTransferDto);
    return response.data;
  } catch (error) {
    console.error('Error al confirmar la transferencia:', error);
    throw error;
  }
};