import { api } from './api';

export async function getContracts(params) {
  const { data } = await api.get('/contracts', { params });
  return data;
}

export async function getContract(id) {
  const { data } = await api.get(`/contracts/${id}`);
  return data;
}

export async function createContract(contract) {
  const { data } = await api.post('/contracts', contract);
  return data;
}

export async function updateContract(id, contract) {
  const { data } = await api.put(`/contracts/${id}`, contract);
  return data;
}

export async function deleteContract(id) {
  await api.delete(`/contracts/${id}`);
}

export async function analyzeContract(id) {
  const { data } = await api.post(`/contracts/${id}/analyze`);
  return data;
}

export async function downloadContract(id) {
  const { data } = await api.get(`/contracts/${id}/download`, {
    responseType: 'blob'
  });
  return data;
} 