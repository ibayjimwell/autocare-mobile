import { useState, useCallback, useEffect, useRef } from 'react';
import { Linking, Alert, AppState } from 'react-native';
import { useFocusEffect } from 'expo-router';
import paymentsApi from '../services/paymentsApi';
import finalBillsApi from '../services/finalBillsApi';
import { useRealtimeTable } from '../connections/useRealtimeTable';

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

  const payload = response?.data ?? response;

  if (typeof payload?.status === 'string') {
    return payload.status.trim().toUpperCase();
  }

  if (typeof payload?.data?.status === 'string') {
    return payload.data.status.trim().toUpperCase();
  }

  return null;
}

function extractApiError(response) {
  if (!response) {
    return null;
  }

  if (
    typeof response?.errorMessage === 'string' &&
    response.errorMessage.trim()
  ) {
    return response.errorMessage;
  }

  if (
    typeof response?.message === 'string' &&
    response.error === true
  ) {
    return response.message;
  }

  return null;
}

function extractPaymentIntentData(response) {
  const payload = response?.data ?? response;

  if (payload?.id || payload?.paymentIntentId) {
    return payload;
  }

  if (payload?.data?.id) {
    return payload.data;
  }

  return null;
}

function extractVerificationData(response) {
  if (!response) {
    return null;
  }

  const firstLevel = response?.data ?? response;

  if (
    firstLevel?.data &&
    typeof firstLevel.data === 'object'
  ) {
    return firstLevel.data;
  }

  return firstLevel;
}

function getPaymentIntentId(paymentIntentData) {
  return (
    paymentIntentData?.paymentIntentId ??
    paymentIntentData?.id ??
    null
  );
}

function getPaymentIntentClientKey(paymentIntentData) {
  return (
    paymentIntentData?.clientKey ??
    paymentIntentData?.client_key ??
    null
  );
}

function getRedirectUrl(paymentIntentData) {
  const attributes =
    paymentIntentData?.attributes ??
    paymentIntentData;

  return (
    attributes?.next_action?.redirect?.url ??
    paymentIntentData?.nextAction?.redirect?.url ??
    paymentIntentData?.redirectUrl ??
    null
  );
}

function getPaymentIntentStatus(paymentIntentData) {
  const attributes =
    paymentIntentData?.attributes ??
    paymentIntentData;

  return (
    attributes?.status ??
    paymentIntentData?.status ??
    null
  );
}

function getPaymongoPublicKey() {
  const publicKey =
    process.env.EXPO_PUBLIC_PAYMONGO_PUBLIC_KEY;

  if (
    typeof publicKey !== 'string' ||
    !publicKey.trim()
  ) {
    throw new Error(
      'EXPO_PUBLIC_PAYMONGO_PUBLIC_KEY is missing from the Expo environment.',
    );
  }

  return publicKey.trim();
}

function base64Encode(value) {
  if (typeof globalThis.btoa === 'function') {
    return globalThis.btoa(value);
  }

  /*
   * Fallback for older React Native/Hermes environments.
   */
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

  let output = '';
  let i = 0;

  while (i < value.length) {
    const chr1 = value.charCodeAt(i++);
    const chr2 = value.charCodeAt(i++);
    const chr3 = value.charCodeAt(i++);

    const enc1 = chr1 >> 2;
    const enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
    const enc3 = Number.isNaN(chr2)
      ? 64
      : ((chr2 & 15) << 2) | (chr3 >> 6);
    const enc4 = Number.isNaN(chr3)
      ? 64
      : chr3 & 63;

    output +=
      chars.charAt(enc1) +
      chars.charAt(enc2) +
      chars.charAt(enc3) +
      chars.charAt(enc4);
  }

  return output;
}

async function paymongoCreatePaymentMethod({
  type,
  details,
  billing,
}) {
  const publicKey = getPaymongoPublicKey();

  const attributes = {
    type,
  };

  if (details) {
    attributes.details = details;
  }

  if (billing) {
    attributes.billing = billing;
  }

  const response = await fetch(
    'https://api.paymongo.com/v1/payment_methods',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${base64Encode(`${publicKey}:`)}`,
      },
      body: JSON.stringify({
        data: {
          attributes,
        },
      }),
    },
  );

  const responseText = await response.text();

  let json;

  try {
    json = JSON.parse(responseText);
  } catch {
    throw new Error(
      `PayMongo returned an invalid response while creating the payment method (HTTP ${response.status}).`,
    );
  }

  if (!response.ok) {
    const detail =
      json?.errors?.[0]?.detail ||
      json?.error ||
      'Unable to create the selected payment method.';

    throw new Error(detail);
  }

  const paymentMethodId = json?.data?.id;

  if (!paymentMethodId) {
    throw new Error(
      'PayMongo did not return a payment method ID.',
    );
  }

  return {
    id: paymentMethodId,
    raw: json,
  };
}

async function paymongoAttachPaymentMethod({
  paymentIntentId,
  clientKey,
  paymentMethodId,
  returnUrl,
}) {
  const publicKey = getPaymongoPublicKey();

  const response = await fetch(
    `https://api.paymongo.com/v1/payment_intents/${encodeURIComponent(
      paymentIntentId,
    )}/attach`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${base64Encode(`${publicKey}:`)}`,
      },
      body: JSON.stringify({
        data: {
          attributes: {
            payment_method: paymentMethodId,
            client_key: clientKey,
            return_url: returnUrl,
          },
        },
      }),
    },
  );

  const responseText = await response.text();

  let json;

  try {
    json = JSON.parse(responseText);
  } catch {
    throw new Error(
      `PayMongo returned an invalid response while attaching the payment method (HTTP ${response.status}).`,
    );
  }

  if (!response.ok) {
    const detail =
      json?.errors?.[0]?.detail ||
      json?.error ||
      'Unable to start the selected payment method.';

    throw new Error(detail);
  }

  return json;
}

function buildMobileReturnUrl(billId) {
  const baseUrl =
    process.env.EXPO_PUBLIC_PAYMONGO_RETURN_URL;

  if (
    typeof baseUrl !== 'string' ||
    !baseUrl.trim()
  ) {
    throw new Error(
      'EXPO_PUBLIC_PAYMONGO_RETURN_URL is missing. Configure it as the public HTTPS PayMongo return endpoint.',
    );
  }

  const separator = baseUrl.includes('?')
    ? '&'
    : '?';

  return `${baseUrl}${separator}billId=${encodeURIComponent(
    billId,
  )}`;
}

function getUrlParameter(url, parameterName) {
  if (typeof url !== 'string' || !url) {
    return null;
  }

  const queryIndex = url.indexOf('?');

  if (queryIndex < 0) {
    return null;
  }

  const hashIndex = url.indexOf('#', queryIndex);
  const query = url.slice(
    queryIndex + 1,
    hashIndex >= 0 ? hashIndex : undefined,
  );

  try {
    const params = new URLSearchParams(query);
    return params.get(parameterName);
  } catch {
    return null;
  }
}

export function usePaymentFlow(
  billId,
  grandTotal,
  customer,
) {
  const normalizedBillId = normalizeId(billId);

  const [state, setState] = useState({
    paying: false,
    paymentIntentId: null,
    referenceNumber: null,
    selectedPaymentMethod: null,
    verifiedPaid: false,
    verifying: false,
    paymentError: null,
  });

  const paymentIntentIdRef = useRef(null);
  const paymentFlowStartedRef = useRef(false);
  const monitorTimerRef = useRef(null);
  const monitorRunningRef = useRef(false);

  const stopPaymentMonitoring = useCallback(() => {
    if (monitorTimerRef.current) {
      clearInterval(monitorTimerRef.current);
      monitorTimerRef.current = null;
    }

    monitorRunningRef.current = false;
  }, []);

  /* ================================================================
     CHECK CURRENT FINAL COST STATUS
  ================================================================ */
  const fetchCurrentStatus = useCallback(
    async showLoading => {
      if (!normalizedBillId) {
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
          extractStatus(response);

        if (currentStatus === 'PAID') {
          stopPaymentMonitoring();

          setState(prev => ({
            ...prev,
            verifiedPaid: true,
            verifying: false,
            paymentError: null,
          }));

          return 'PAID';
        }

        return currentStatus;
      } catch (error) {
        console.error(
          '[PaymentFlow] Final Cost status check failed:',
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
    [normalizedBillId, stopPaymentMonitoring],
  );

  /* ================================================================
     VERIFY PAYMENT INTENT SERVER-SIDE
  ================================================================ */
  const verifyPaymentIntent = useCallback(
    async (
      paymentIntentId,
      showLoading = true,
      silent = false,
    ) => {
      if (!normalizedBillId || !paymentIntentId) {
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
            paymentIntentId,
          );

        const responseError =
          extractApiError(response);

        if (responseError) {
          throw new Error(responseError);
        }

        const verificationData =
          extractVerificationData(response);

        const paid =
          verificationData?.paid === true ||
          response?.paid === true;

        const referenceNumber =
          verificationData?.referenceNumber ??
          response?.referenceNumber ??
          null;

        if (paid) {
          stopPaymentMonitoring();

          setState(prev => ({
            ...prev,
            verifiedPaid: true,
            verifying: false,
            referenceNumber:
              referenceNumber ??
              prev.referenceNumber,
            paymentError: null,
          }));

          return true;
        }

        return false;
      } catch (error) {
        console.error(
          '[PaymentFlow] Payment Intent verification failed:',
          error,
        );

        if (!silent) {
          setState(prev => ({
            ...prev,
            paymentError:
              error?.message ||
              'Unable to verify the payment.',
          }));
        }

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
    [normalizedBillId, stopPaymentMonitoring],
  );

  /* ================================================================
     REALTIME Final Cost STATUS
  ================================================================ */
  const handleRealtimeChange = useCallback(
    payload => {
      const nextRecord =
        payload?.new ??
        payload?.record ??
        null;

      const changedStatus =
        nextRecord?.status;

      if (typeof changedStatus !== 'string') {
        return;
      }

      const normalizedStatus =
        changedStatus.trim().toUpperCase();

      console.log(
        '[PaymentFlow] Realtime Final Cost update:',
        normalizedStatus,
      );

      if (normalizedStatus === 'PAID') {
        paymentFlowStartedRef.current = false;
        stopPaymentMonitoring();

        setState(prev => ({
          ...prev,
          verifiedPaid: true,
          verifying: false,
          paymentError: null,
        }));
      }
    },
    [stopPaymentMonitoring],
  );

  useRealtimeTable(
    'final_bills',
    normalizedBillId
      ? `id=eq.${normalizedBillId}`
      : null,
    handleRealtimeChange,
  );

  /* ================================================================
     INITIAL STATUS CHECK
  ================================================================ */
  useEffect(() => {
    fetchCurrentStatus(false);
  }, [fetchCurrentStatus]);

  /* ================================================================
     RESET BILL-SPECIFIC STATE WHEN BILL CHANGES
  ================================================================ */
  useEffect(() => {
    stopPaymentMonitoring();
    paymentIntentIdRef.current = null;
    paymentFlowStartedRef.current = false;

    setState({
      paying: false,
      paymentIntentId: null,
      referenceNumber: null,
      selectedPaymentMethod: null,
      verifiedPaid: false,
      verifying: false,
      paymentError: null,
    });
  }, [normalizedBillId, stopPaymentMonitoring]);

  /* ================================================================
     PAYMENT COMPLETION MONITOR

     Realtime remains the primary live UI path. This short retry loop is
     intentionally limited and is used only after a PayMongo redirect/
     authentication return or a Payment Intent that is still processing.
     It makes the app recover when the webhook/realtime delivery arrives
     slightly later than the customer's return to the app.
  ================================================================ */
  const startPaymentMonitoring = useCallback(
    paymentIntentId => {
      if (
        !normalizedBillId ||
        !paymentIntentId ||
        monitorRunningRef.current ||
        state.verifiedPaid
      ) {
        return;
      }

      stopPaymentMonitoring();
      monitorRunningRef.current = true;

      let attempts = 0;
      const maxAttempts = 20;

      const check = async () => {
        attempts += 1;

        const paid =
          await verifyPaymentIntent(
            paymentIntentId,
            false,
            true,
          );

        if (paid) {
          stopPaymentMonitoring();
          return;
        }

        const currentStatus =
          await fetchCurrentStatus(false);

        if (currentStatus === 'PAID') {
          stopPaymentMonitoring();
          return;
        }

        if (attempts >= maxAttempts) {
          stopPaymentMonitoring();
          return;
        }

        if (!monitorTimerRef.current) {
          monitorTimerRef.current = setInterval(
            () => {
              void check();
            },
            2000,
          );
        }
      };

      void check();
    },
    [
      normalizedBillId,
      state.verifiedPaid,
      stopPaymentMonitoring,
      verifyPaymentIntent,
      fetchCurrentStatus,
    ],
  );

  /* ================================================================
     ATTACH SELECTED PAYMENT METHOD
  ================================================================ */
  const createAndAttachPaymentMethod =
    useCallback(
      async (
        paymentMethod,
        paymentIntentData,
        returnUrl,
        paymentMethodDetails,
        billing,
      ) => {
        const paymentIntentId =
          getPaymentIntentId(
            paymentIntentData,
          );

        const clientKey =
          getPaymentIntentClientKey(
            paymentIntentData,
          );

        if (!paymentIntentId || !clientKey) {
          throw new Error(
            'PayMongo did not return the credentials needed to continue this payment.',
          );
        }

        const paymentMethodResource =
          await paymongoCreatePaymentMethod({
            type: paymentMethod,
            details: paymentMethodDetails,
            billing,
          });

        const attached =
          await paymongoAttachPaymentMethod({
            paymentIntentId,
            clientKey,
            paymentMethodId:
              paymentMethodResource.id,
            returnUrl,
          });

        return {
          paymentIntentId,
          attached,
        };
      },
      [],
    );

  /* ================================================================
     PAY ONLINE — GCASH / MAYA
  ================================================================ */
  const startPayment = useCallback(
    async paymentMethod => {
      if (!normalizedBillId) {
        Alert.alert(
          'Payment Error',
          'Invalid Final Cost ID.',
        );
        return false;
      }

      if (
        paymentMethod !== 'gcash' &&
        paymentMethod !== 'paymaya'
      ) {
        Alert.alert(
          'Payment Error',
          'This payment method is handled by the card payment flow.',
        );
        return false;
      }

      if (state.paying || state.verifying) {
        return false;
      }

      const amount =
        Number.parseFloat(
          String(grandTotal ?? 0),
        ) || 0;

      if (amount <= 0) {
        Alert.alert(
          'Payment Error',
          'Invalid payment amount.',
        );
        return false;
      }

      const currentStatus =
        await finalBillsApi
          .getStatus(normalizedBillId)
          .then(extractStatus)
          .catch(error => {
            console.warn(
              '[PaymentFlow] Pre-payment status check failed:',
              error,
            );
            return null;
          });

      if (currentStatus === 'PAID') {
        setState(prev => ({
          ...prev,
          verifiedPaid: true,
        }));
        return true;
      }

      setState(prev => ({
        ...prev,
        paying: true,
        paymentError: null,
        selectedPaymentMethod:
          paymentMethod,
      }));

      paymentFlowStartedRef.current = false;

      try {
        const intentResponse =
          await paymentsApi.createPaymentIntent(
            normalizedBillId,
            paymentMethod,
          );

        const apiError =
          extractApiError(intentResponse);

        if (apiError) {
          throw new Error(apiError);
        }

        const paymentIntentData =
          extractPaymentIntentData(
            intentResponse,
          );

        if (!paymentIntentData) {
          throw new Error(
            'PayMongo Payment Intent was not returned by the server.',
          );
        }

        const paymentIntentId =
          getPaymentIntentId(
            paymentIntentData,
          );

        if (!paymentIntentId) {
          throw new Error(
            'PayMongo Payment Intent ID was not returned by the server.',
          );
        }

        paymentIntentIdRef.current =
          paymentIntentId;

        setState(prev => ({
          ...prev,
          paymentIntentId,
          paymentError: null,
        }));

        const returnUrl = buildMobileReturnUrl(
          normalizedBillId,
        );

        const { attached } =
          await createAndAttachPaymentMethod(
            paymentMethod,
            paymentIntentData,
            returnUrl,
            undefined,
            undefined,
          );

        const attachedData =
          attached?.data ?? attached;

        const status =
          getPaymentIntentStatus(
            attachedData,
          );

        const normalizedStatus = String(
          status ?? '',
        )
          .trim()
          .toLowerCase();

        if (normalizedStatus === 'succeeded') {
          return await verifyPaymentIntent(
            paymentIntentId,
            true,
          );
        }

        const redirectUrl =
          getRedirectUrl(attachedData);

        if (!redirectUrl) {
          throw new Error(
            'PayMongo did not return a payment redirect URL for this payment method.',
          );
        }

        const canOpen =
          await Linking.canOpenURL(
            redirectUrl,
          );

        if (!canOpen) {
          throw new Error(
            'Unable to open the selected payment provider.',
          );
        }

        paymentFlowStartedRef.current = true;
        await Linking.openURL(redirectUrl);
        return true;
      } catch (error) {
        paymentFlowStartedRef.current = false;
        console.error(
          '[PaymentFlow] E-wallet payment creation error:',
          error,
        );

        const message =
          error?.message ||
          'Could not initiate payment.';

        setState(prev => ({
          ...prev,
          paymentError: message,
        }));

        Alert.alert(
          'Payment Error',
          message,
        );

        return false;
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
      state.verifying,
      createAndAttachPaymentMethod,
      verifyPaymentIntent,
    ],
  );

  /* ================================================================
     PAY ONLINE — DEBIT / CREDIT CARD
  ================================================================ */
  const payWithCard = useCallback(
    async cardDetails => {
      if (!normalizedBillId) {
        throw new Error('Invalid Final Cost ID.');
      }

      if (state.paying || state.verifying) {
        return false;
      }

      const amount =
        Number.parseFloat(
          String(grandTotal ?? 0),
        ) || 0;

      if (amount <= 0) {
        throw new Error('Invalid payment amount.');
      }

      const currentStatus =
        await finalBillsApi
          .getStatus(normalizedBillId)
          .then(extractStatus)
          .catch(() => null);

      if (currentStatus === 'PAID') {
        setState(prev => ({
          ...prev,
          verifiedPaid: true,
        }));
        return true;
      }

      setState(prev => ({
        ...prev,
        paying: true,
        paymentError: null,
        selectedPaymentMethod: 'card',
      }));

      paymentFlowStartedRef.current = false;

      try {
        const intentResponse =
          await paymentsApi.createPaymentIntent(
            normalizedBillId,
            'card',
          );

        const apiError =
          extractApiError(intentResponse);

        if (apiError) {
          throw new Error(apiError);
        }

        const paymentIntentData =
          extractPaymentIntentData(
            intentResponse,
          );

        if (!paymentIntentData) {
          throw new Error(
            'PayMongo Payment Intent was not returned by the server.',
          );
        }

        const paymentIntentId =
          getPaymentIntentId(
            paymentIntentData,
          );

        if (!paymentIntentId) {
          throw new Error(
            'PayMongo Payment Intent ID was not returned by the server.',
          );
        }

        paymentIntentIdRef.current =
          paymentIntentId;

        setState(prev => ({
          ...prev,
          paymentIntentId,
          paymentError: null,
        }));

        const returnUrl = buildMobileReturnUrl(
          normalizedBillId,
        );

        const billing = {
          name: cardDetails.name,
          email:
            cardDetails.email ||
            undefined,
          phone:
            cardDetails.phone ||
            undefined,
        };

        const { attached } =
          await createAndAttachPaymentMethod(
            'card',
            paymentIntentData,
            returnUrl,
            {
              card_number:
                cardDetails.cardNumber,
              exp_month:
                cardDetails.expMonth,
              exp_year:
                cardDetails.expYear,
              cvc: cardDetails.cvc,
            },
            billing,
          );

        const attachedData =
          attached?.data ?? attached;

        const status =
          getPaymentIntentStatus(
            attachedData,
          );

        const normalizedStatus = String(
          status ?? '',
        )
          .trim()
          .toLowerCase();

        if (normalizedStatus === 'succeeded') {
          return await verifyPaymentIntent(
            paymentIntentId,
            true,
          );
        }

        const redirectUrl =
          getRedirectUrl(attachedData);

        if (
          normalizedStatus ===
          'awaiting_next_action'
        ) {
          if (!redirectUrl) {
            throw new Error(
              'Your bank requires additional authentication, but PayMongo did not return an authentication URL.',
            );
          }

          const canOpen =
            await Linking.canOpenURL(
              redirectUrl,
            );

          if (!canOpen) {
            throw new Error(
              'Unable to open your bank authentication page.',
            );
          }

          paymentFlowStartedRef.current =
            true;

          /*
           * Raw card details are intentionally not kept after this point.
           * The PayMongo Payment Method is already tokenized.
           */
          await Linking.openURL(redirectUrl);
          return true;
        }

        if (normalizedStatus === 'processing') {
          paymentFlowStartedRef.current = true;
          startPaymentMonitoring(
            paymentIntentId,
          );
          return true;
        }

        const lastPaymentError =
          attachedData?.attributes
            ?.last_payment_error ??
          attachedData?.last_payment_error;

        throw new Error(
          lastPaymentError?.detail ||
            lastPaymentError?.message ||
            'The card payment could not be completed.',
        );
      } catch (error) {
        paymentFlowStartedRef.current = false;
        console.error(
          '[PaymentFlow] Card payment error:',
          error,
        );

        setState(prev => ({
          ...prev,
          paymentError:
            error?.message ||
            'Could not process the card payment.',
        }));

        throw error;
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
      state.verifying,
      createAndAttachPaymentMethod,
      verifyPaymentIntent,
      startPaymentMonitoring,
    ],
  );

  /* ================================================================
     HANDLE HTTPS RETURN -> AUTOCare CUSTOM URL

     The server bridge appends paymentIntentId to the custom URL. The
     existing screen used focus recovery, but it did not explicitly
     consume the native deep-link event. This listener makes the return
     deterministic even when the app resumes without a navigation change.
  ================================================================ */
  useEffect(() => {
    const handleIncomingUrl = ({ url }) => {
      const incomingBillId =
        getUrlParameter(url, 'billId');

      const incomingPaymentIntentId =
        getUrlParameter(
          url,
          'paymentIntentId',
        ) ??
        getUrlParameter(
          url,
          'payment_intent_id',
        );

      if (
        normalizedBillId &&
        incomingBillId &&
        incomingBillId !== normalizedBillId
      ) {
        return;
      }

      if (incomingPaymentIntentId) {
        paymentIntentIdRef.current =
          incomingPaymentIntentId;

        setState(prev => ({
          ...prev,
          paymentIntentId:
            incomingPaymentIntentId,
          paymentError: null,
        }));
      }

      paymentFlowStartedRef.current = true;

      const paymentIntentId =
        incomingPaymentIntentId ??
        paymentIntentIdRef.current;

      if (!paymentIntentId) {
        void fetchCurrentStatus(true);
        return;
      }

      const verifyReturnedPayment =
        async () => {
          const verified =
            await verifyPaymentIntent(
              paymentIntentId,
              true,
            );

          if (verified) {
            paymentFlowStartedRef.current =
              false;
            return;
          }

          startPaymentMonitoring(
            paymentIntentId,
          );
        };

      void verifyReturnedPayment();
    };

    const subscription =
      Linking.addEventListener(
        'url',
        handleIncomingUrl,
      );

    void Linking.getInitialURL()
      .then(url => {
        if (url) {
          handleIncomingUrl({ url });
        }
      })
      .catch(error => {
        console.warn(
          '[PaymentFlow] Unable to read initial deep link:',
          error,
        );
      });

    return () => {
      subscription?.remove?.();
    };
  }, [
    normalizedBillId,
    fetchCurrentStatus,
    verifyPaymentIntent,
    startPaymentMonitoring,
  ]);

  /* ================================================================
     APP ACTIVE RECOVERY
  ================================================================ */
  useEffect(() => {
    const subscription =
      AppState.addEventListener(
        'change',
        nextState => {
          if (nextState !== 'active') {
            return;
          }

          if (
            !normalizedBillId ||
            state.verifiedPaid
          ) {
            return;
          }

          const paymentIntentId =
            paymentIntentIdRef.current ??
            state.paymentIntentId;

          if (!paymentFlowStartedRef.current && !paymentIntentId) {
            return;
          }

          const recover = async () => {
            if (paymentIntentId) {
              const verified =
                await verifyPaymentIntent(
                  paymentIntentId,
                  true,
                );

              if (verified) {
                paymentFlowStartedRef.current =
                  false;
                return;
              }

              startPaymentMonitoring(
                paymentIntentId,
              );
              return;
            }

            await fetchCurrentStatus(true);
          };

          void recover();
        },
      );

    return () => {
      subscription.remove();
    };
  }, [
    normalizedBillId,
    state.verifiedPaid,
    state.paymentIntentId,
    verifyPaymentIntent,
    startPaymentMonitoring,
    fetchCurrentStatus,
  ]);

  /* ================================================================
     RETURN / FOCUS RECOVERY
  ================================================================ */
  useFocusEffect(
    useCallback(() => {
      if (
        !normalizedBillId ||
        state.verifiedPaid
      ) {
        return undefined;
      }

      const paymentIntentId =
        paymentIntentIdRef.current ??
        state.paymentIntentId;

      if (
        !paymentFlowStartedRef.current &&
        !paymentIntentId
      ) {
        return undefined;
      }

      const verifyAfterReturn = async () => {
        const resolvedPaymentIntentId =
          paymentIntentIdRef.current ??
          state.paymentIntentId;

        if (!resolvedPaymentIntentId) {
          const status =
            await fetchCurrentStatus(true);

          if (status === 'PAID') {
            paymentFlowStartedRef.current =
              false;
          }

          return;
        }

        const verified =
          await verifyPaymentIntent(
            resolvedPaymentIntentId,
            true,
          );

        if (verified) {
          paymentFlowStartedRef.current =
            false;
          return;
        }

        startPaymentMonitoring(
          resolvedPaymentIntentId,
        );
      };

      void verifyAfterReturn();

      return undefined;
    }, [
      normalizedBillId,
      state.verifiedPaid,
      state.paymentIntentId,
      verifyPaymentIntent,
      fetchCurrentStatus,
      startPaymentMonitoring,
    ]),
  );

  /* ================================================================
     FINAL CLEANUP
  ================================================================ */
  useEffect(() => {
    return () => {
      stopPaymentMonitoring();
    };
  }, [stopPaymentMonitoring]);

  return {
    startPayment,
    payWithCard,
    paying: state.paying,
    paymentIntentId: state.paymentIntentId,
    referenceNumber: state.referenceNumber,
    selectedPaymentMethod:
      state.selectedPaymentMethod,
    verifiedPaid: state.verifiedPaid,
    verifying: state.verifying,
    paymentError: state.paymentError,
  };
}