// services/finalBillsApi.js
import api from './api';

const finalBillsApi = {
  getByAppointment: (appointmentId) =>
    api.request(`/payments/final-bills?appointmentId=${appointmentId}`, 'GET', null, true),
  
  // New: fetch a single final bill with all details
  getById: (billId) =>
    api.request(`/payments/final-bills/${billId}`, 'GET', null, true),
};

export default finalBillsApi;