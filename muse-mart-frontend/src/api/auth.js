// src/api/auth.js
import api from './axiosConfig';

export const registerUser = async (name, email, password, phone) => {
  const response = await api.post('/auth/signup', { name, email, password, phone });
  return response.data;
};

export const loginUser = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const getUserProfile = async (token) => {
  const response = await api.get('/profile', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};