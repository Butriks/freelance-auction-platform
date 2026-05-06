import client from './client.js';

export function getTaskBids(taskId) {
  return client.get(`/api/tasks/${taskId}/bids`);
}

export function createBid(taskId, payload) {
  return client.post(`/api/tasks/${taskId}/bids`, payload);
}

export function acceptBid(taskId, bidId) {
  return client.post(`/api/tasks/${taskId}/accept-bid/${bidId}`);
}
