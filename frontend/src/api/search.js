import api from './axios';
export const searchApi = {
  search:      (q, params) => api.get('/search', { params: { q, ...params } }),
  suggestions: (q)         => api.get('/search/suggestions', { params: { q } }),
};
