import client from './client.js';

export function getContractReviews(contractId) {
  return client.get(`/api/contracts/${contractId}/reviews`);
}

export function createReview(contractId, payload) {
  return client.post(`/api/contracts/${contractId}/reviews`, payload);
}

export function getUserReviews(userId, params = {}) {
  return client.get(`/api/users/${userId}/reviews`, { params });
}
