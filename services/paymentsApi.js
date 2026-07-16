// services/paymentsApi.js
import api from './api';

const paymentsApi = {
  // Create PayMongo checkout for a bill
  payOnline: (billId) =>
    api.request(`/payments/final-bills/${billId}/pay-online`, 'POST', null, true),
  
   verifyPayment: (billId, paymongoLinkId) =>
    api.request(
      `/payments/final-bills/${billId}/verify-payment`,
      'POST',
      { paymongoLinkId },
      true
    ),
};

export default paymentsApi;