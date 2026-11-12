import api from './api';

function normalizeId(
  value,
) {
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }

  return value ?? '';
}

const paymentsApi = {
  /*
   * Create a PayMongo Payment Intent for exactly one payment method.
   *
   * The backend calculates the amount from the Final Cost.
   */
  createPaymentIntent: (
    billId,
    paymentMethod,
  ) => {
    const id =
      normalizeId(
        billId,
      );

    return api.request(
      `/payments/final-bills/${encodeURIComponent(
        id,
      )}/pay-online`,
      'POST',
      {
        paymentMethod,
      },
      true,
    );
  },

  // Hosted checkout for GCash, Maya and Credit/Debit Cards.
  createHostedCheckout: (billId, paymentMethod) => api.request(
    `/payments/final-bills/${encodeURIComponent(normalizeId(billId))}/checkout`,
    'POST', { paymentMethod }, true,
  ),

  getHostedCheckout: billId => api.request(
    `/payments/final-bills/${encodeURIComponent(normalizeId(billId))}/checkout`,
    'GET', null, true,
  ),

  cancelHostedCheckout: billId => api.request(
    `/payments/final-bills/${encodeURIComponent(normalizeId(billId))}/checkout`,
    'DELETE', null, true,
  ),

  /*
   * Verify the Payment Intent server-side.
   *
   * The backend retrieves the Payment Intent using the PayMongo secret key,
   * validates ownership/amount/currency/status, and only then marks
   * OFFICIAL -> PAID.
   */
  getQrPhStatus: (billId, paymentIntentId = null) => {
    const id = normalizeId(billId);
    const query = paymentIntentId
      ? `?paymentIntentId=${encodeURIComponent(paymentIntentId)}`
      : '';
    return api.request(
      `/payments/final-bills/${encodeURIComponent(id)}/qrph-status${query}`,
      'GET', null, true,
    );
  },

  verifyPayment: (
    billId,
    paymentIntentId,
  ) => {
    const id =
      normalizeId(
        billId,
      );

    return api.request(
      `/payments/final-bills/${encodeURIComponent(
        id,
      )}/verify-payment`,
      'POST',
      {
        paymentIntentId,
      },
      true,
    );
  },
};

export default paymentsApi;
