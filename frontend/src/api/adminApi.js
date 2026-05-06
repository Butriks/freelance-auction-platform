import client from './client.js';

export function getAdminUsers(params = {}) {
  return client.get('/api/admin/users', { params });
}

export function blockUser(id) {
  return client.patch(`/api/admin/users/${id}/block`);
}

export function unblockUser(id) {
  return client.patch(`/api/admin/users/${id}/unblock`);
}

export function getAdminTasks(params = {}) {
  return client.get('/api/admin/tasks', { params });
}

export function getAdminContracts(params = {}) {
  return client.get('/api/admin/contracts', { params });
}

export function getAdminDisputes(params = {}) {
  return client.get('/api/admin/disputes', { params });
}

export function resolveDispute(id, payload) {
  return client.patch(`/api/admin/disputes/${id}/resolve`, payload);
}

export function getAdminLogs(params = {}) {
  return client.get('/api/admin/logs', { params });
}

export function getAdminAnalytics() {
  return client.get('/api/admin/analytics');
}
