import {
  useState,
  useCallback,
  useEffect,
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
   * The mobile app no longer talks directly to PayMongo's API.
   *
   * Mobile
   *   ↓
   * /api/payments/final-bills/:id/pay-online
   *   ↓
   * PayMongo
   *
   * The backend creates the link and the server-side PayMongo
   * webhook/verification changes final_bills.status to PAID.
   *
   * Realtime then updates this screen.
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

          setState(prev => ({
            ...prev,
            paymongoLinkId:
              paymongoLinkId ??
              null,
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

          await Linking.openURL(
            checkoutUrl,
          );

          /*
           * No polling starts here.
           *
           * final_bills realtime remains active while the customer
           * completes payment.
           */
        } catch (error) {
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
   * RETURN / FOCUS RECOVERY
   * ================================================================
   *
   * When the customer returns from PayMongo, perform one status
   * check. This covers the case where the application was suspended
   * while the browser was open and a realtime event was missed.
   *
   * This is one request per focus event, NOT polling.
   * ================================================================
   */

  useFocusEffect(
    useCallback(() => {
      if (
        !normalizedBillId ||
        state.verifiedPaid
      ) {
        return;
      }

      const verifyAfterReturn =
        async () => {
          await fetchCurrentStatus(
            true,
          );
        };

      verifyAfterReturn();
    }, [
      normalizedBillId,
      state.verifiedPaid,
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