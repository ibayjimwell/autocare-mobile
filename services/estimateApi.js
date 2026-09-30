import api from './api';

const estimateApi = {
  // Get estimate list for an appointment.
  getByAppointment: (appointmentId) =>
    api.request(
      `/payments/estimates?appointmentId=${encodeURIComponent(appointmentId)}`,
      'GET',
      null,
      true,
    ),

  // Get full estimate details by ID.
  get: (estimateId) =>
    api.request(
      `/payments/estimates/${encodeURIComponent(estimateId)}`,
      'GET',
      null,
      true,
    ),

  // Approve an estimate with the customer's final finding selection.
  approve: (estimateId, includedFindingIds = []) =>
    api.request(
      `/payments/estimates/${encodeURIComponent(estimateId)}/approve`,
      'PATCH',
      {
        includedFindingIds: Array.isArray(includedFindingIds)
          ? includedFindingIds.filter(Boolean)
          : [],
      },
      true,
    ),

  // Toggle finding inclusion while the estimate is waiting for approval.
  toggleFinding: (estimateId, findingId, included) =>
    api.request(
      `/payments/estimates/${encodeURIComponent(estimateId)}/findings/${encodeURIComponent(
        findingId,
      )}/toggle`,
      'PATCH',
      {
        included: Boolean(included),
      },
      true,
    ),

  // Decline an estimate with reason.
  decline: (estimateId, reason) =>
    api.request(
      `/payments/estimates/${encodeURIComponent(estimateId)}/decline`,
      'PATCH',
      { reason },
      true,
    ),

  // List estimates for a customer.
  listByCustomer: (customerId) =>
    api.request(
      `/payments/estimates?customerId=${encodeURIComponent(customerId)}`,
      'GET',
      null,
      true,
    ),
};

export default estimateApi;
