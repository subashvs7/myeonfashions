import api from './axios';

export const returnsApi = {
  getAll: () => api.get('/returns'),
  create: (data) => api.post('/returns', data),
};
