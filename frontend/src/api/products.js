import api from './axios';

export const productsApi = {
  getAll:       (params)  => api.get('/products', { params }),
  getOne:       (slug)    => api.get(`/products/${slug}`),
  getFeatured:  ()        => api.get('/products/featured'),
  getNewArrivals:()       => api.get('/products/new-arrivals'),
  getBestsellers:()       => api.get('/products/bestsellers'),
  getRelated:   (id)      => api.get(`/products/${id}/related`),
};
