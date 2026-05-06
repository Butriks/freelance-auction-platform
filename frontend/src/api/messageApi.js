import client from './client.js';

export function getContractMessages(contractId, params = {}) {
  return client.get(`/api/contracts/${contractId}/messages`, { params });
}

export function createMessage(contractId, payload) {
  return client.post(`/api/contracts/${contractId}/messages`, payload);
}
