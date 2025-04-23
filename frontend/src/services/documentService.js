import axios from 'axios';

const API_URL = 'http://localhost:3000/';

export const fetchUserDocuments = async (userId, token) => {
  const response = await axios.get(`${API_URL}/documents/user/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const deleteDocument = async (documentId, token) => {
    const response = await axios.delete(`${API_URL}/documents/${documentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
};
  