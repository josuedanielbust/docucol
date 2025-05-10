import axios from 'axios';

const API_URL = `${process.env.REACT_APP_BASE_URL}/users`; 

export const signup = async (data) => {
  const response = await axios.post(`${API_URL}/auth/signup`, data);
  return response.data;
};

export const signin = async (data) => {
  const response = await axios.post(`${API_URL}/auth/signin`, data);
  return response.data;
};
