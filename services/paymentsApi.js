import api from './api';

const paymentsApi = {
  /*
   * Create a PayMongo checkout link for a Final Cost.
   */
  payOnline: billId =>
    api.request(
      `/payments/final-bills/${encodeURIComponent(
        billId,
      )}/pay-online`,
      'POST',
      null,
      true,
    ),

  /*
   * Verify PayMongo payment status.
   */
  verifyPayment: (
    billId,
    paymongoLinkId,
  ) =>
    api.request(
      `/payments/final-bills/${encodeURIComponent(
        billId,
      )}/verify-payment`,
      'POST',
      {
        paymongoLinkId,
      },
      true,
    ),
};

export default paymentsApi;