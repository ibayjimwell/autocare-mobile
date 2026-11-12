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

  // Upload a photo to an already saved vehicle (JWT-authenticated, signed server-side).
  uploadPhoto: (customerId, vehicleId, asset) => {
    const form = new FormData();
    form.append('photo', {
      uri: asset.uri,
      name: asset.fileName || `vehicle-${vehicleId}.jpg`,
      type: asset.mimeType || 'image/jpeg',
    });
    return api.request(`/customers/${customerId}/vehicles/${vehicleId}/photo`, 'POST', form, true);
  },

  removePhoto: (customerId, vehicleId) =>
    api.request(`/customers/${customerId}/vehicles/${vehicleId}/photo`, 'DELETE', null, true),

  // Delete a vehicle
  delete: (customerId, vehicleId) =>
    api.request(`/customers/${customerId}/vehicles/${vehicleId}`, 'DELETE', null, true),
};

export default vehiclesApi;