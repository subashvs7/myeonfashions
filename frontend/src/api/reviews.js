import api from './axios';
export const reviewsApi = {
  get:    (productId, params) => api.get(`/products/${productId}/reviews`, { params }),
  create: (productId, data)   => api.post(`/products/${productId}/reviews`, data),
};
