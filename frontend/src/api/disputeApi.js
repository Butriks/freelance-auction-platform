import client from './client.js';

export function createDispute(contractId, payload) {
  return client.post(`/api/contracts/${contractId}/disputes`, payload);
}

export function getMyDisputes(params = {}) {
  return client.get('/api/disputes/my', { params });
}
