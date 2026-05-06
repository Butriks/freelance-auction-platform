import client from './client.js';

export function getContractMilestones(contractId) {
  return client.get(`/api/contracts/${contractId}/milestones`);
}

export function createMilestone(contractId, payload) {
  return client.post(`/api/contracts/${contractId}/milestones`, payload);
}

export function submitMilestone(milestoneId) {
  return client.patch(`/api/milestones/${milestoneId}/submit`);
}

export function approveMilestone(milestoneId) {
  return client.patch(`/api/milestones/${milestoneId}/approve`);
}

export function rejectMilestone(milestoneId, payload) {
  return client.patch(`/api/milestones/${milestoneId}/reject`, payload);
}
