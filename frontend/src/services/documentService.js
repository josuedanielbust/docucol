import axios from 'axios';

const API_URL = process.env.REACT_APP_BASE_URL; 

export const fetchUserDocuments = async (userId, token) => {
  const response = await axios.get(`${API_URL}/documents/documents/user/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const uploadDocument = async (file, title, token, userId) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', title);
  formData.append('userId', userId);
  return axios.post(`${API_URL}/documents/documents`, formData, {
    headers: { Authorization: `Bearer ${token}`,
    'Content-Type': 'multipart/form-data' }
  });
};

export const deleteDocument = async (documentId, token) => {
    const response = await axios.delete(`${API_URL}/documents/documents/${documentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
};

export const requestAuthentication = async (doc, token) => {
  return axios.post(
    `${API_URL}/interop/gov-api/documents/authenticate`,
    {
      userId: doc.userId,
      documentPath: doc.filePath,
      documentTitle: doc.title,
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};