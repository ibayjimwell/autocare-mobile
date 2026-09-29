import api from './api';

const estimateApi = {
  // Get estimate for an appointment (list)
  getByAppointment: (appointmentId) =>
    api.request(`/payments/estimates?appointmentId=${appointmentId}`, 'GET', null, true),

  // Get full estimate details by ID
  get: (estimateId) =>
    api.request(`/payments/estimates/${estimateId}`, 'GET', null, true),

  // Approve an estimate with the customer's final finding selection
  approve: (estimateId, includedFindingIds = []) =>
    api.request(
      `/payments/estimates/${estimateId}/approve`,
      'PATCH',
      { includedFindingIds },
      true,
    ),

  // Toggle finding inclusion while the estimate is waiting for approval
  toggleFinding: (estimateId, findingId, included) =>
    api.request(
      `/payments/estimates/${estimateId}/findings/${findingId}/toggle`,
      'PATCH',
      { included },
      true,
    ),

  // Decline an estimate with reason
  decline: (estimateId, reason) =>
    api.request(`/payments/estimates/${estimateId}/decline`, 'PATCH', { reason }, true),

  // List estimates for a customer
  listByCustomer: (customerId) =>
    api.request(`/payments/estimates?customerId=${customerId}`, 'GET', null, true),
};

export default estimateApi;
