import api from './axios';

export const paymentApi = {
  createOrder: (orderId) => api.post('/payment/create-order', { order_id: orderId }),
  verify:      (data)    => api.post('/payment/verify', data),
  retry:       (orderId) => api.post(`/payment/retry/${orderId}`),
};
