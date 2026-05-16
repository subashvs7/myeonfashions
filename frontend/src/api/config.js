import api from './axios';

export const configApi = {
  get: () => api.get('/config'),
};

export const menuApi = {
  getItems: (location) => api.get('/menu-items', { params: { location } }),
};

export const footerApi = {
  getSections: () => api.get('/footer-sections'),
};
