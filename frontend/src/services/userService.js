import axios from 'axios';

const API_URL = 'http://localhost:3000/';

export const updateUser = async (userId, data, token) => {
  const response = await axios.patch(`${API_URL}/users/${userId}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
