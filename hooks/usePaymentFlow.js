import {
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';

import {
  Linking,
  Alert,
} from 'react-native';

import {
  useFocusEffect,
} from 'expo-router';

import paymentsApi from '../services/paymentsApi';
import finalBillsApi from '../services/finalBillsApi';

import {
  useRealtimeTable,
} from '../connections/useRealtimeTable';

function normalizeId(value) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function extractStatus(response) {
  if (!response) {
    return null;
  }

  const payload =
    response?.data ??
    response;

  if (
    typeof payload?.status ===
    'string'
  ) {
    return payload.status
      .trim()
      .toUpperCase();
  }

  if (
    typeof payload?.data?.status ===
    'string'
  ) {
    return payload.data.status
      .trim()
      .toUpperCase();
  }

  return null;
}

function extractPaymentData(
  response,
) {
  if (!response) {
    return null;
  }

  /*
   * Expected server response:
   *
   * {
   *   error: false,
   *   message: "Payment link created.",
   *   data: {
   *     checkoutUrl,
   *     paymongoLinkId,
   *     referenceNumber
   *   }
   * }
   */
  if (
    response?.data &&
    typeof response.data ===
      'object'
  ) {
    return response.data;
  }

  return response;
}

function extractVerificationData(
  response,
) {
  if (!response) {
    return null;
  }

  /*
   * Support:
   *
   * {
   *   paid: true
   * }
   *
   * and:
   *
   * {
   *   data: {
   *     paid: true
   *   }
   * }
   *
   * and:
   *
   * {
   *   data: {
   *     data: {
   *       paid: true
   *     }
   *   }
   * }
   */
  const firstLevel =
    response?.data ??
    response;

  if (
    firstLevel?.data &&
    typeof firstLevel.data ===
      'object'
  ) {
    return firstLevel.data;
  }

  return firstLevel;
}

export function usePaymentFlow(
  billId,
  grandTotal,
) {
  const normalizedBillId =
    normalizeId(billId);

  const [
    state,
    setState,
  ] = useState({
    paying: false,
    paymongoLinkId: null,
    referenceNumber: null,
    verifiedPaid: false,
    verifying: false,
  });

  /*
   * Keep the PayMongo link ID outside of normal component
   * state so the return/focus callback always has the latest
   * value without causing the focus effect to execute
   * immediately when the link is created.
   */
  const paymongoLinkIdRef =
    useRef(null);

  /*
   * This becomes true only after the PayMongo checkout
   * has actually been opened.
   *
   * Therefore the initial screen focus does not attempt
   * payment verification.
   */
  const checkoutOpenedRef =
    useRef(false);

  /*
   * ================================================================
   * CHECK CURRENT BILL STATUS
   * ================================================================
   *
   * This is a snapshot check only.
   *
   * It is NOT polling.
   */
  const fetchCurrentStatus =
    useCallback(
      async showLoading => {
        if (
          !normalizedBillId
        ) {
          return null;
        }

        if (showLoading) {
          setState(prev => ({
            ...prev,
            verifying: true,
          }));
        }

        try {
          const response =
            await finalBillsApi.getStatus(
              normalizedBillId,
            );

          const currentStatus =
            extractStatus(
              response,
            );

          if (
            currentStatus ===
            'PAID'
          ) {
            setState(prev => ({
              ...prev,
              verifiedPaid: true,
              verifying: false,
            }));

            return 'PAID';
          }

          return currentStatus;
        } catch (error) {
          console.error(
            '[PaymentFlow] Status check failed:',
            error,
          );

          return null;
        } finally {
          if (showLoading) {
            setState(prev => ({
              ...prev,
              verifying: false,
            }));
          }
        }
      },
      [normalizedBillId],
    );

  /*
   * ================================================================
   * VERIFY PAYMONGO PAYMENT
   * ================================================================
   *
   * This is the important return-from-checkout verification.
   *
   * Mobile
   *   ↓
   * PayMongo checkout
   *   ↓
   * Customer authorizes payment
   *   ↓
   * App becomes focused again
   *   ↓
   * /api/payments/final-bills/:id/verify-payment
   *   ↓
   * Server checks PayMongo
   *   ↓
   * FinalBill.status = PAID
   * ================================================================
   */
  const verifyPayMongoPayment =
    useCallback(
      async (
        paymongoLinkId,
        showLoading = true,
      ) => {
        if (
          !normalizedBillId ||
          !paymongoLinkId
        ) {
          return false;
        }

        if (showLoading) {
          setState(prev => ({
            ...prev,
            verifying: true,
          }));
        }

        try {
          const response =
            await paymentsApi.verifyPayment(
              normalizedBillId,
              paymongoLinkId,
            );

          const verificationData =
            extractVerificationData(
              response,
            );

          const paid =
            verificationData?.paid ===
              true ||
            response?.paid === true;

          const referenceNumber =
            verificationData?.referenceNumber ??
            response?.referenceNumber ??
            null;

          if (paid) {
            setState(prev => ({
              ...prev,
              verifiedPaid: true,
              verifying: false,
              referenceNumber:
                referenceNumber ??
                prev.referenceNumber,
            }));

            console.log(
              '[PaymentFlow] PayMongo payment verified successfully.',
            );

            return true;
          }

          console.log(
            '[PaymentFlow] PayMongo payment is not completed yet.',
          );

          return false;
        } catch (error) {
          console.error(
            '[PaymentFlow] PayMongo verification failed:',
            error,
          );

          return false;
        } finally {
          if (showLoading) {
            setState(prev => ({
              ...prev,
              verifying: false,
            }));
          }
        }
      },
      [normalizedBillId],
    );

  /*
   * ================================================================
   * REALTIME Final Cost STATUS
   * ================================================================
   */

  const handleRealtimeChange =
    useCallback(
      payload => {
        const nextRecord =
          payload?.new ??
          payload?.record ??
          null;

        const changedStatus =
          nextRecord?.status;

        if (
          typeof changedStatus !==
          'string'
        ) {
          return;
        }

        const normalizedStatus =
          changedStatus
            .trim()
            .toUpperCase();

        console.log(
          '[PaymentFlow] Realtime Final Cost status:',
          normalizedStatus,
        );

        if (
          normalizedStatus ===
          'PAID'
        ) {
          setState(prev => ({
            ...prev,
            verifiedPaid: true,
            verifying: false,
          }));
        }
      },
      [],
    );

  useRealtimeTable(
    'final_bills',
    normalizedBillId
      ? `id=eq.${normalizedBillId}`
      : null,
    handleRealtimeChange,
  );

  /*
   * ================================================================
   * INITIAL STATUS CHECK
   * ================================================================
   */

  useEffect(() => {
    fetchCurrentStatus(
      false,
    );
  }, [
    fetchCurrentStatus,
  ]);

  /*
   * ================================================================
   * PAY ONLINE
   * ================================================================
   *
   * The mobile app does not talk directly to PayMongo's API.
   *
   * Mobile
   *   ↓
   * /api/payments/final-bills/:id/pay-online
   *   ↓
   * PayMongo
   *
   * The backend creates the link.
   * The app then opens the checkout URL.
   * ================================================================
   */

  const startPayment =
    useCallback(
      async () => {
        if (
          !normalizedBillId
        ) {
          Alert.alert(
            'Payment Error',
            'Invalid Final Cost ID.',
          );

          return;
        }

        const amount =
          Number.parseFloat(
            String(
              grandTotal ?? 0,
            ),
          ) || 0;

        if (amount <= 0) {
          Alert.alert(
            'Payment Error',
            'Invalid payment amount.',
          );

          return;
        }

        /*
         * Do not start another payment while one is being created.
         */
        if (
          state.paying
        ) {
          return;
        }

        /*
         * The bill may already have been paid by another payment
         * method. Do a single status check before creating a link.
         */
        try {
          const currentStatus =
            await finalBillsApi.getStatus(
              normalizedBillId,
            );

          if (
            extractStatus(
              currentStatus,
            ) === 'PAID'
          ) {
            setState(prev => ({
              ...prev,
              verifiedPaid: true,
            }));

            return;
          }
        } catch (error) {
          /*
           * Do not block the payment flow solely because the snapshot
           * check failed. The realtime subscription is still active.
           */
          console.warn(
            '[PaymentFlow] Pre-payment status check failed:',
            error,
          );
        }

        setState(prev => ({
          ...prev,
          paying: true,
        }));

        try {
          const response =
            await paymentsApi.payOnline(
              normalizedBillId,
            );

          const paymentData =
            extractPaymentData(
              response,
            );

          const checkoutUrl =
            paymentData?.checkoutUrl;

          const paymongoLinkId =
            paymentData?.paymongoLinkId;

          const referenceNumber =
            paymentData?.referenceNumber;

          if (!checkoutUrl) {
            throw new Error(
              paymentData?.errorMessage ||
                response?.errorMessage ||
                response?.message ||
                'Payment checkout URL was not returned.',
            );
          }

          if (!paymongoLinkId) {
            throw new Error(
              'PayMongo payment link ID was not returned by the server.',
            );
          }

          /*
           * Keep the link ID for the return-from-checkout verification.
           */
          paymongoLinkIdRef.current =
            paymongoLinkId;

          setState(prev => ({
            ...prev,
            paymongoLinkId:
              paymongoLinkId,
            referenceNumber:
              referenceNumber ??
              null,
          }));

          const canOpen =
            await Linking.canOpenURL(
              checkoutUrl,
            );

          if (!canOpen) {
            throw new Error(
              'Unable to open the payment checkout.',
            );
          }

          /*
           * Mark this as a real checkout session before leaving
           * the application.
           *
           * The focus callback will use this flag when the customer
           * returns from PayMongo.
           */
          checkoutOpenedRef.current =
            true;

          await Linking.openURL(
            checkoutUrl,
          );
        } catch (error) {
          checkoutOpenedRef.current =
            false;

          console.error(
            '[PaymentFlow] Payment creation error:',
            error,
          );

          Alert.alert(
            'Payment Error',
            error?.message ||
              'Could not initiate payment.',
          );
        } finally {
          setState(prev => ({
            ...prev,
            paying: false,
          }));
        }
      },
      [
        normalizedBillId,
        grandTotal,
        state.paying,
      ],
    );

  /*
   * ================================================================
   * RETURN / FOCUS RECOVERY + PAYMONGO VERIFICATION
   * ================================================================
   *
   * When the customer returns from PayMongo:
   *
   * 1. Verify the PayMongo payment directly.
   * 2. The server changes final_bills.status to PAID.
   * 3. If direct verification says not paid, perform one DB
   *    snapshot check as a fallback.
   *
   * This is NOT polling.
   */
  useFocusEffect(
    useCallback(() => {
      if (
        !checkoutOpenedRef.current ||
        !normalizedBillId ||
        state.verifiedPaid
      ) {
        return undefined;
      }

      const verifyAfterReturn =
        async () => {
          /*
           * Consume the flag immediately so the same checkout
           * does not repeatedly verify during additional focus events.
           */
          checkoutOpenedRef.current =
            false;

          const paymongoLinkId =
            paymongoLinkIdRef.current;

          if (!paymongoLinkId) {
            console.warn(
              '[PaymentFlow] No PayMongo link ID available after return. Checking Final Cost status only.',
            );

            await fetchCurrentStatus(
              true,
            );

            return;
          }

          const verified =
            await verifyPayMongoPayment(
              paymongoLinkId,
              true,
            );

          if (verified) {
            return;
          }

          /*
           * PayMongo verification can legitimately return before the
           * server-side state has propagated. Make one final database
           * snapshot check, still without polling.
           */
          await fetchCurrentStatus(
            true,
          );
        };

      verifyAfterReturn();

      return undefined;
    }, [
      normalizedBillId,
      state.verifiedPaid,
      verifyPayMongoPayment,
      fetchCurrentStatus,
    ]),
  );

  /*
   * ================================================================
   * CLEAN RETURN API
   * ================================================================
   */

  return {
    startPayment,

    paying:
      state.paying,

    paymongoLinkId:
      state.paymongoLinkId,

    referenceNumber:
      state.referenceNumber,

    verifiedPaid:
      state.verifiedPaid,

    verifying:
      state.verifying,
  };
}