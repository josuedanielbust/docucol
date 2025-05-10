import axios from 'axios';

// Función para obtener un operador por correo
export const getOperadorPorCorreo = async (email) => {
  try {
    const response = await axios.get('http://localhost:3000/gov-api/operators?email=${email}');
    return response.data;
  } catch (error) {
    console.error('Error al obtener el operador por correo:', error);
    throw error;
  }
};

// Función para obtener todos los operadores
export const getOperadores = async () => {
  try {
    const response = await axios.get('http://localhost:3000/gov-api/operators');
    return response.data;
  } catch (error) {
    console.error('Error al obtener los operadores:', error);
    throw error;
  }
};