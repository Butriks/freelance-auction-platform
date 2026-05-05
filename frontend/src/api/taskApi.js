import client from './client.js';

export function getTasks(params = {}) {
  return client.get('/api/tasks', { params });
}

export function getTaskById(id) {
  return client.get(`/api/tasks/${id}`);
}

export function createTask(payload) {
  return client.post('/api/tasks', payload);
}

export function updateTask(id, payload) {
  return client.patch(`/api/tasks/${id}`, payload);
}

export function deleteTask(id) {
  return client.delete(`/api/tasks/${id}`);
}
