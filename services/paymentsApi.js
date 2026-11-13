import api from './api';

function first(value) { return Array.isArray(value) ? value[0] ?? '' : value ?? ''; }
function url(billId) { return `/payments/final-bills/${encodeURIComponent(first(billId))}/paypal`; }

/** AutoCare never creates a payment or captures funds on the device. */
const paymentsApi = {
  createPaypalCheckout: billId => api.request(url(billId),'POST',{},true),
  getPaypalCheckout: billId => api.request(url(billId),'GET',null,true),
};
export default paymentsApi;
