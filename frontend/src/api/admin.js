import api from './axios';

export const adminApi = {
  // Dashboard — single endpoint returns { stats, recentOrders, salesChart, topProducts }
  dashboard: () => api.get('/admin/dashboard'),

  // Products
  getProducts: (params) => api.get('/admin/products', { params }),
  getProduct: (id) => api.get(`/admin/products/${id}`),
  createProduct: (data) => api.post('/admin/products', data),
  updateProduct: (id, data) => api.put(`/admin/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  uploadProductImages: (id, data) => api.post(`/admin/products/${id}/images`, data),
  deleteProductImage: (id, imgId) => api.delete(`/admin/products/${id}/images/${imgId}`),
  bulkStatus: (data) => api.post('/admin/products/bulk-status', data),
  importProducts: (file) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post('/admin/products/import', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  importTemplate: () => api.get('/admin/products/import/template', { responseType: 'blob' }),

  // Categories
  getCategories: () => api.get('/admin/categories'),
  createCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
  reorderCategories: (data) => api.post('/admin/categories/reorder', data),

  // Orders
  getOrders: (params) => api.get('/admin/orders', { params }),
  getOrder: (id) => api.get(`/admin/orders/${id}`),
  updateOrderStatus: (id, data) => api.put(`/admin/orders/${id}/status`, data),
  addTracking: (id, data) => api.post(`/admin/orders/${id}/tracking`, data),

  // Customers
  getCustomers: (params) => api.get('/admin/customers', { params }),
  getCustomer:  (id) => api.get(`/admin/customers/${id}`),
  updateCustomer: (id, data) => api.put(`/admin/customers/${id}`, data),
  deleteCustomer: (id) => api.delete(`/admin/customers/${id}`),

  // Coupons
  getCoupons: () => api.get('/admin/coupons'),
  createCoupon: (data) => api.post('/admin/coupons', data),
  updateCoupon: (id, data) => api.put(`/admin/coupons/${id}`, data),
  deleteCoupon: (id) => api.delete(`/admin/coupons/${id}`),

  // Inventory — correct path: /inventory/variant/{id}
  getInventory: (params) => api.get('/admin/inventory', { params }),
  updateStock: (variantId, data) => api.put(`/admin/inventory/variant/${variantId}`, data),
  getLowStock: () => api.get('/admin/inventory/low-stock'),

  // Shipping — backend uses /shipping-zones
  getShipping: () => api.get('/admin/shipping-zones'),
  createShipping: (data) => api.post('/admin/shipping-zones', data),
  updateShipping: (id, data) => api.put(`/admin/shipping-zones/${id}`, data),
  deleteShipping: (id) => api.delete(`/admin/shipping-zones/${id}`),

  // Returns
  getReturns: (params) => api.get('/admin/returns', { params }),
  getReturn: (id) => api.get(`/admin/returns/${id}`),
  updateReturn: (id, data) => api.put(`/admin/returns/${id}`, data),

  // Reviews
  getReviews: (params) => api.get('/admin/reviews', { params }),
  updateReview: (id, data) => api.put(`/admin/reviews/${id}/status`, data),
  deleteReview: (id) => api.delete(`/admin/reviews/${id}`),

  // Banners
  getBanners: () => api.get('/admin/banners'),
  createBanner: (data) => api.post('/admin/banners', data),
  updateBanner: (id, data) => data instanceof FormData
    ? api.post(`/admin/banners/${id}`, data)
    : api.put(`/admin/banners/${id}`, data),
  deleteBanner: (id) => api.delete(`/admin/banners/${id}`),

  // Settings
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),
  uploadLogo: (file) => {
    const fd = new FormData();
    fd.append('logo', file);
    return api.post('/admin/settings/logo', fd);
  },
  uploadFavicon: (file) => {
    const fd = new FormData();
    fd.append('favicon', file);
    return api.post('/admin/settings/favicon', fd);
  },

  // Orders extra
  orderStatusCounts: () => api.get('/admin/orders/status-counts'),
  orderInvoice: (id) => api.get(`/admin/orders/${id}/invoice`),
  manifestDownload: (params) => api.get('/admin/orders/manifest', { params, responseType: 'blob' }),

  // Flash Sales
  getFlashSales: () => api.get('/admin/flash-sales'),
  getFlashSale: (id) => api.get(`/admin/flash-sales/${id}`),
  createFlashSale: (data) => api.post('/admin/flash-sales', data),
  updateFlashSale: (id, data) => api.put(`/admin/flash-sales/${id}`, data),
  deleteFlashSale: (id) => api.delete(`/admin/flash-sales/${id}`),
  addFlashSaleProducts: (id, data) => api.post(`/admin/flash-sales/${id}/products`, data),
  removeFlashSaleProduct: (saleId, productId) => api.delete(`/admin/flash-sales/${saleId}/products/${productId}`),

  // New Arrivals
  getNewArrivals: (params) => api.get('/admin/new-arrivals', { params }),
  toggleNewArrival: (productId) => api.put(`/admin/new-arrivals/${productId}`),

  // Menu Management
  getMenuItems: (params) => api.get('/admin/menu-items', { params }),
  createMenuItem: (data) => api.post('/admin/menu-items', data),
  updateMenuItem: (id, data) => api.put(`/admin/menu-items/${id}`, data),
  deleteMenuItem: (id) => api.delete(`/admin/menu-items/${id}`),
  reorderMenuItems: (data) => api.post('/admin/menu-items/reorder', data),

  // Footer Management
  getFooterSections: () => api.get('/admin/footer-sections'),
  createFooterSection: (data) => api.post('/admin/footer-sections', data),
  updateFooterSection: (id, data) => api.put(`/admin/footer-sections/${id}`, data),
  deleteFooterSection: (id) => api.delete(`/admin/footer-sections/${id}`),
  createFooterLink: (sectionId, data) => api.post(`/admin/footer-sections/${sectionId}/links`, data),
  updateFooterLink: (id, data) => api.put(`/admin/footer-links/${id}`, data),
  deleteFooterLink: (id) => api.delete(`/admin/footer-links/${id}`),

  // Header Management
  getHeaderSettings: () => api.get('/admin/header-settings'),
  updateHeaderSettings: (data) => api.put('/admin/header-settings', data),

  // Reports
  salesReport: (params) => api.get('/admin/reports/sales', { params }),
  profitReport: (params) => api.get('/admin/reports/profit', { params }),
  gstReport: (params) => api.get('/admin/reports/gst', { params }),
  productsReport: () => api.get('/admin/reports/products'),
  customersReport: () => api.get('/admin/reports/customers'),
  inventoryReport: () => api.get('/admin/reports/inventory'),
  exportReport: (params) => api.get('/admin/reports/export', { params, responseType: 'blob' }),
};
