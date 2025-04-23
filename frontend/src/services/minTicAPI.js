import axios from 'axios';

const API_BASE = 'https://govcarpeta-apis-4905ff3c005b.herokuapp.com';

export const getOperadorPorCorreo = async (correo) => {
  try {
    const response = await axios.get(`${API_BASE}/centralizador/operador/${correo}`);
    return response.data.operador;
  } catch (error) {
    console.error("Error al consultar operador:", error);
    return null;
  }
};
