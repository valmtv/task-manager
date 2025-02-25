import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const api = axios.create({ baseURL: 'http://localhost:5001/api' });

export const setAuthToken = (token) => {
  localStorage.setItem('token', token);
};

export const getAuthToken = () => {
  return localStorage.getItem('token');
};

export const getUserRole = () => {
  const token = getAuthToken();
  if (token) {
    try {
      const decoded = jwtDecode(token);
      return decoded.role;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
  return null;
};

export const fetchUserData = async () => {
  try {
    const response = await api.get('/users/user');
    return response.data;
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
