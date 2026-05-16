import api from './axios';
export const notificationsApi = {
  getAll:       (params) => api.get('/notifications', { params }),
  markRead:     (id)     => api.post(`/notifications/${id}/read`),
  markAllRead:  ()       => api.post('/notifications/read-all'),
  unreadCount:  ()       => api.get('/notifications/unread-count'),
};
