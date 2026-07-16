import api from './api';

const finalBillsApi = {
  // Get final bill for an appointment
  getByAppointment: (appointmentId) =>
    api.request(`/payments/final-bills?appointmentId=${appointmentId}`, 'GET', null, true),
};

export default finalBillsApi;