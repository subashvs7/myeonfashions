import api from './axios';

export const cartApi = {
  get:       ()         => api.get('/cart'),
  add:       (data)     => api.post('/cart/add', data),
  update:    (id, qty)  => api.put(`/cart/item/${id}`, { quantity: qty }),
  remove:    (id)       => api.delete(`/cart/item/${id}`),
  clear:     ()         => api.delete('/cart/clear'),
  merge:     (sessionId)=> api.post('/cart/merge', { session_id: sessionId }),
  guestAdd:  (data)     => api.post('/cart/guest', data),
};
