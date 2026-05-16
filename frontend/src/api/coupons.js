import api from './axios';
export const couponsApi = {
  apply:  (code, subtotal) => api.post('/coupon/apply', { code, subtotal }),
  remove: ()               => api.delete('/coupon/remove'),
};
