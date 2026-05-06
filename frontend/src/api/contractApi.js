import client from './client.js';

export function getMyContracts(params = {}) {
  return client.get('/api/contracts/my', { params });
}

export function getContractById(id) {
  return client.get(`/api/contracts/${id}`);
}
