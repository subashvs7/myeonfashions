import api from './axios';

export const authApi = {
  register:       (data)         => api.post('/auth/register', data),
  login:          (data)         => api.post('/auth/login', data),
  logout:         ()             => api.post('/auth/logout'),
  me:             ()             => api.get('/auth/me'),
  updateProfile:  (data)         => api.put('/auth/profile', data),
  changePassword: (data)         => api.post('/auth/change-password', data),
  uploadAvatar:   (formData)     => api.post('/auth/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  forgotPassword: (data)         => api.post('/auth/forgot-password', data),
  resetPassword:  (data)         => api.post('/auth/reset-password', data),
  sendOtp:        (phone)        => api.post('/auth/send-otp', { phone }),
  verifyOtp:      (phone, otp)   => api.post('/auth/verify-otp', { phone, otp }),
};
