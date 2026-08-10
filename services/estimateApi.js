import api from './api';

const estimateApi = {
  // Get estimate for an appointment (list)
  getByAppointment: (appointmentId) =>
    api.request(`/payments/estimates?appointmentId=${appointmentId}`, 'GET', null, true),

  // Get full estimate details by ID
  get: (estimateId) =>
    api.request(`/payments/estimates/${estimateId}`, 'GET', null, true),

  // Approve an estimate
  approve: (estimateId) =>
    api.request(`/payments/estimates/${estimateId}/approve`, 'PATCH', null, true),

  // Decline an estimate with reason
  decline: (estimateId, reason) =>
    api.request(`/payments/estimates/${estimateId}/decline`, 'PATCH', { reason }, true),

  // List estimates for a customer
  listByCustomer: (customerId) =>
    api.request(`/payments/estimates?customerId=${customerId}`, 'GET', null, true),
};

export default estimateApi;