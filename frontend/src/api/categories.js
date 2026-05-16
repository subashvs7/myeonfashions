import api from './axios';

export const categoriesApi = {
  getAll:    ()      => api.get('/categories'),
  getOne:    (slug)  => api.get(`/categories/${slug}`),
  getProducts: (slug, params) => api.get(`/categories/${slug}/products`, { params }),
};
