import api from './api';

function normalizeId(value) {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

function billPath(billId) {
  return `/payments/final-bills/${encodeURIComponent(normalizeId(billId))}`;
}

const paymentsApi = {
  // Existing QR Ph Payment Intent flow. Do not remove or alter this API.
  createPaymentIntent: (billId, paymentMethod) => api.request(
    `${billPath(billId)}/pay-online`,
    'POST',
    { paymentMethod },
    true,
  ),

  // PayMongo Hosted Checkout Sessions for GCash, Maya, and Cards.
  // The Web API holds PayMongo credentials and creates the real checkout URL.
  createHostedCheckout: (billId, paymentMethod) => api.request(
    `${billPath(billId)}/checkout`,
    'POST',
    { paymentMethod },
    true,
  ),

  // The authenticated server verifies PayMongo and performs settlement.
  getHostedCheckout: billId => api.request(
    `${billPath(billId)}/checkout`,
    'GET',
    null,
    true,
  ),

  cancelHostedCheckout: billId => api.request(
    `${billPath(billId)}/checkout`,
    'DELETE',
    null,
    true,
  ),

  // Preserve the original QR Ph polling and verification calls.
  getQrPhStatus: (billId, paymentIntentId = null) => {
    const query = paymentIntentId
      ? `?paymentIntentId=${encodeURIComponent(paymentIntentId)}`
      : '';
    return api.request(
      `${billPath(billId)}/qrph-status${query}`,
      'GET',
      null,
      true,
    );
  },

  verifyPayment: (billId, paymentIntentId) => api.request(
    `${billPath(billId)}/verify-payment`,
    'POST',
    { paymentIntentId },
    true,
  ),
};

export default paymentsApi;
