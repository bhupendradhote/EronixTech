// services/compareService.ts
import axios from 'axios';
import type { CompareProduct } from '../types/compare';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  console.log('API_URL:', API_URL);
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const getCompare = async (): Promise<CompareProduct[]> => {
  const { data } = await axios.get(`${API_URL}/compare`, {
    headers: getAuthHeaders(),
  });
  return data.data;
};

const addToCompare = async (productId: number): Promise<void> => {
  await axios.post(
    `${API_URL}/compare`,
    { productId },
    { headers: getAuthHeaders() }
  );
};

const removeFromCompare = async (productId: number): Promise<void> => {
  await axios.delete(`${API_URL}/compare/${productId}`, {
    headers: getAuthHeaders(),
  });
};

const clearCompare = async (): Promise<void> => {
  await axios.delete(`${API_URL}/compare`, {
    headers: getAuthHeaders(),
  });
};

const compareService = {
  getCompare,
  addToCompare,
  removeFromCompare,
  clearCompare,
};

export default compareService;