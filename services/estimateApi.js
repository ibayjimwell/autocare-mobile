import api from './api';

const estimateApi = {
  // Get estimate for an appointment
  getByAppointment: (appointmentId) =>
    api.request(`/payments/estimates?appointmentId=${appointmentId}`, 'GET', null, true),

  // Approve an estimate
  approve: (estimateId) =>
    api.request(`/payments/estimates/${estimateId}/approve`, 'PATCH', null, true),

  // Decline an estimate with reason
  decline: (estimateId, reason) =>
    api.request(`/payments/estimates/${estimateId}/decline`, 'PATCH', { reason }, true),
};

export default estimateApi;