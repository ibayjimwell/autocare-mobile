import api from './api';
function normalizeId(value) {
    if (Array.isArray(value)) {
        return value[0] ?? '';
    }
    return value ?? '';
}
const paymentsApi = {
    /*
     * Create a Payment Intent for exactly one payment method.
     *
     * The backend calculates the amount from the Final Cost. The mobile
     * client never sends an amount, so the customer cannot change the bill
     * total from the app.
     */
    createPaymentIntent: (billId, paymentMethod) => {
        const id = normalizeId(billId);
        return api.request(`/payments/final-bills/${encodeURIComponent(id)}/pay-online`, 'POST', {
            paymentMethod,
        }, true);
    },
    /*
     * Verify the Payment Intent server-side.
     *
     * The backend retrieves the Payment Intent with the PayMongo secret key,
     * validates that it belongs to this Final Cost, and only then marks the
     * Final Cost as PAID.
     */
    verifyPayment: (billId, paymentIntentId) => {
        const id = normalizeId(billId);
        return api.request(`/payments/final-bills/${encodeURIComponent(id)}/verify-payment`, 'POST', {
            paymentIntentId,
        }, true);
    },
};
export default paymentsApi;
