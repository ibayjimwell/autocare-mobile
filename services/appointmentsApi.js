import api from './api';

const appointmentsApi = {
  // List appointments with filters
  list: (params = {}) => {
    const query = new URLSearchParams();
    if (params.customerId) query.set('customerId', params.customerId);
    if (params.status) query.set('status', params.status);
    const qs = query.toString();
    return api.request(`/appointments${qs ? '?' + qs : ''}`, 'GET', null, true);
  },

  // Get single appointment
  get: (id) => api.request(`/appointments/${id}`, 'GET', null, true),

  // Create appointment – uses FormData because backend expects it
  create: (data) => {
    const form = new FormData();
    form.append('customerId', data.customerId);
    form.append('vehicleId', data.vehicleId);
    form.append('services', JSON.stringify([data.serviceId]));   // backend expects array
    form.append('appointmentDate', data.appointmentDate);
    form.append('appointmentTime', data.appointmentTime);
    if (data.notes) form.append('notes', data.notes);
    return api.request('/appointments', 'POST', form, true);
  },

  // Cancel appointment
  cancel: (id, reason = '') =>
    api.request(`/appointments/${id}/status`, 'PATCH', { status: 'CANCELLED', reason }, true),

  // Get available slots for a given date and a single service
  getAvailableSlots: (date, serviceId) =>
    api.request(`/appointments/available-slots?date=${date}&serviceIds=${serviceId}`, 'GET', null, true),

  // Check custom time availability
  checkAvailability: (date, startTime, serviceId) =>
    api.request('/appointments/check-availability', 'POST', { date, startTime, serviceIds: serviceId }, true),
};

export default appointmentsApi;