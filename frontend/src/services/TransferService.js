import axios from 'axios';

// Configuración base de Axios
const apiClient = axios.create({
  baseURL: 'http://localhost:3000/transfer',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Función para iniciar una transferencia
const initiateTransfer = async (initiateTransferDto) => {
  if (!initiateTransferDto) {
    throw new Error('El objeto initiateTransferDto es requerido.');
  }

  try {
    const response = await apiClient.post('/initiate', initiateTransferDto);
    return response.data;
  } catch (error) {
    handleApiError(error, 'Error al iniciar la transferencia');
  }
};

// Función para confirmar una transferencia
const confirmTransfer = async (confirmTransferDto) => {
  if (!confirmTransferDto) {
    throw new Error('El objeto confirmTransferDto es requerido.');
  }

  try {
    const response = await apiClient.post('/confirm', confirmTransferDto);
    return response.data;
  } catch (error) {
    handleApiError(error, 'Error al confirmar la transferencia');
  }
};

// Función para manejar errores de la API
const handleApiError = (error, defaultMessage) => {
  const errorMessage =
    error.response?.data?.message || error.message || defaultMessage;
  console.error(errorMessage);
  throw new Error(errorMessage);
};

// Función para obtener la lista de operadores
const getOperadores = async () => {
  try {
    const response = await apiClient.get('/operadores'); // Ajusta la ruta según tu API
    return response.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener la lista de operadores');
  }
};

// Función para transferir a un operador
const transferToOperador = async (operadorId) => {
  if (!operadorId) {
    throw new Error('El ID del operador es requerido.');
  }

  try {
    const initiateTransferDto = { operadorId }; // Construye el objeto necesario
    const response = await initiateTransfer(initiateTransferDto); // Llama a initiateTransfer
    return response; // Devuelve la respuesta
  } catch (error) {
    handleApiError(error, 'Error al transferir al operador');
  }
};

// Exporta las funciones necesarias
export { initiateTransfer, confirmTransfer, getOperadores, transferToOperador };