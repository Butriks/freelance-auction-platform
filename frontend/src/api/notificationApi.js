import client from './client.js';

export function getNotifications(params = {}) {
  return client.get('/api/notifications', { params });
}

export function getUnreadCount() {
  return client.get('/api/notifications/unread-count');
}

export function markNotificationAsRead(id) {
  return client.patch(`/api/notifications/${id}/read`);
}

export function markAllNotificationsAsRead() {
  return client.patch('/api/notifications/read-all');
}
