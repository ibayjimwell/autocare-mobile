import api from './api';

const vehiclesApi = {
  // List all vehicles for a customer
  listByCustomer: (customerId) =>
    api.request(`/customers/${customerId}/vehicles`, 'GET', null, true),

  // Get a single vehicle
  get: (customerId, vehicleId) =>
    api.request(`/customers/${customerId}/vehicles/${vehicleId}`, 'GET', null, true),

  // Create a new vehicle – customerId goes in the URL
  create: (customerId, data) =>
    api.request(`/customers/${customerId}/vehicles`, 'POST', data, true),

  // Update a vehicle
  update: (customerId, vehicleId, data) =>
    api.request(`/customers/${customerId}/vehicles/${vehicleId}`, 'PUT', data, true),

  // Delete a vehicle
  delete: (customerId, vehicleId) =>
    api.request(`/customers/${customerId}/vehicles/${vehicleId}`, 'DELETE', null, true),
};

export default vehiclesApi;