import api from './api';

const path = (billId) => `/payments/final-bills/${encodeURIComponent(String(billId))}/manual-transfer`;

const manualTransferApi = {
  get: (billId) => api.request(path(billId), 'GET', null, true),
  submit: (billId, details) => api.request(path(billId), 'POST', details, true),
};

export default manualTransferApi;
