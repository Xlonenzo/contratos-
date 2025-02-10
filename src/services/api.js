import axios from 'axios';
import { API_URL } from '../config';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Endpoints
export const endpoints = {
  dashboard: {
    stats: '/api/dashboard/stats'
  },
  contracts: {
    list: '/api/contracts',
    details: (id) => `/api/contracts/${id}`,
    create: '/api/contracts',
    update: (id) => `/api/contracts/${id}`,
    delete: (id) => `/api/contracts/${id}`
  },
  analyses: {
    list: '/api/analyses',
    create: '/api/analyses',
    details: (id) => `/api/analyses/${id}`
  }
}; 