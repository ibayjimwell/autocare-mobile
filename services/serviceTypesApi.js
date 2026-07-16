import api from './api';

const serviceTypesApi = {
  // List active services (public)
  listActive: () => api.request('/services?active=true', 'GET', null, false),

  // List all services (admin only – requires auth)
  listAll: () => api.request('/services', 'GET', null, true),

  // Get single service
  get: (id) => api.request(`/services/${id}`, 'GET', null, true),

  // Get trending services (public)
  getTrending: () => api.request('/services/trending', 'GET', null, false),

  // Create service (admin)
  create: (data) => api.request('/services', 'POST', data, true),

  // Update service (admin)
  update: (id, data) => api.request(`/services/${id}`, 'PUT', data, true),
};

export default serviceTypesApi;