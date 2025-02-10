import { api } from './api';

export async function login(credentials) {
  const { data } = await api.post('/auth/login', credentials);
  return data;
}

export async function logout() {
  localStorage.removeItem('token');
  window.location.href = '/login';
}

export async function getCurrentUser() {
  const { data } = await api.get('/auth/me');
  return data;
} 