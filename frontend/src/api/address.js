import api from './axios';
export const addressApi = {
  getAll:     ()       => api.get('/addresses'),
  create:     (data)   => api.post('/addresses', data),
  update:     (id, d)  => api.put(`/addresses/${id}`, d),
  delete:     (id)     => api.delete(`/addresses/${id}`),
  setDefault: (id)     => api.post(`/addresses/${id}/default`),
};
