import axios from 'axios';

const API_URL = `${process.env.REACT_APP_BASE_URL}/users`; 

export const updateUser = async (userId, data, token) => {
  console.log("TOKEN", token)
  const response = await axios.patch(`${API_URL}/users/${userId}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};