// services/receiptApi.js
import api from './api';

const receiptApi = {
  // Get receipt for a Final Cost
  getByFinalBill: (finalBillId) =>
    api.request(`/payments/receipts?finalBillId=${finalBillId}`, 'GET', null, true),
};

export default receiptApi;
