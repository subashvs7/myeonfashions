import api from './axios';
export const bannersApi = { getAll: () => api.get('/banners') };
