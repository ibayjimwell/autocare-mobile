// services/finalBillsApi.js (add the new method)
import api from './api';

const finalBillsApi = {
  getByAppointment: (appointmentId) =>
    api.request(`/payments/final-bills?appointmentId=${appointmentId}`, 'GET', null, true),
  
  getById: (billId) =>
    api.request(`/payments/final-bills/${billId}`, 'GET', null, true),

  listByCustomer: (customerId) =>
    api.request(`/payments/final-bills?customerId=${customerId}`, 'GET', null, true),

   getStatus: (billId) =>
    api.request(`/payments/final-bills/${billId}/status`, 'GET', null, true),
};

export default finalBillsApi;