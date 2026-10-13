import {
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';

import {
  Alert,
  AppState,
} from 'react-native';

import {
  useFocusEffect,
} from 'expo-router';

import paymentsApi from '../services/paymentsApi';

import finalBillsApi from '../services/finalBillsApi';

import {
  useRealtimeTable,
} from '../connections/useRealtimeTable';

const QRPH_EXPIRY_SECONDS = 1800;

const QRPH_POLL_INTERVAL_MS = 3000;

const QRPH_MAX_POLL_ATTEMPTS =
  Math.ceil(
    QRPH_EXPIRY_SECONDS /
      (QRPH_POLL_INTERVAL_MS / 1000),
  );

function normalizeId(
  value,
) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function extractStatus(
  response,
) {
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

function extractApiError(
  response,
) {
  if (!response) {
    return null;
  }

  if (
    typeof response?.errorMessage ===
      'string' &&
    response.errorMessage.trim()
  ) {
    return response.errorMessage;
  }

  if (
    typeof response?.message ===
      'string' &&
    response.error === true
  ) {
    return response.message;
  }

  return null;
}

function extractPaymentIntentData(
  response,
) {
  const payload =
    response?.data ??
    response;

  if (
    payload?.id ||
    payload?.paymentIntentId
  ) {
    return payload;
  }

  if (
    payload?.data?.id
  ) {
    return payload.data;
  }

  return null;
}

function extractVerificationData(
  response,
) {
  if (!response) {
    return null;
  }

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

function getPaymentIntentId(
  paymentIntentData,
) {
  return (
    paymentIntentData?.paymentIntentId ??
    paymentIntentData?.id ??
    null
  );
}

function getPaymentIntentClientKey(
  paymentIntentData,
) {
  return (
    paymentIntentData?.clientKey ??
    paymentIntentData?.client_key ??
    null
  );
}

function getPaymentIntentStatus(
  paymentIntentData,
) {
  const attributes =
    paymentIntentData?.attributes ??
    paymentIntentData;

  return (
    attributes?.status ??
    paymentIntentData?.status ??
    null
  );
}

function getQrImageUrl(
  paymentIntentData,
) {
  const attributes =
    paymentIntentData?.attributes ??
    paymentIntentData;

  const candidate =
    attributes?.next_action
      ?.code
      ?.image_url ??
    attributes?.nextAction
      ?.code
      ?.imageUrl ??
    paymentIntentData
      ?.next_action
      ?.code
      ?.image_url ??
    paymentIntentData
      ?.nextAction
      ?.code
      ?.imageUrl ??
    null;

  if (
    typeof candidate !==
    'string'
  ) {
    return null;
  }

  const normalized =
    candidate.trim();

  if (!normalized) {
    return null;
  }

  /*
   * PayMongo currently returns image_url as a Base64 image URL.
   * Support a raw Base64 string too so the renderer remains resilient
   * to either form.
   */
  if (
    normalized.startsWith(
      'data:image/',
    ) ||
    normalized.startsWith(
      'https://',
    ) ||
    normalized.startsWith(
      'http://',
    )
  ) {
    return normalized;
  }

  return `data:image/png;base64,${normalized}`;
}

function getQrPhTestUrl(paymentIntentData) {
  const attributes =
    paymentIntentData?.attributes ??
    paymentIntentData;

  const candidate =
    attributes?.next_action
      ?.code
      ?.test_url ??
    attributes?.next_action
      ?.test_url ??
    attributes?.test_url ??
    paymentIntentData?.test_url ??
    null;

  if (
    typeof candidate !==
    'string'
  ) {
    return null;
  }

  const normalized =
    candidate.trim();

  return normalized || null;
}

function getPaymongoPublicKey() {
  const publicKey =
    process.env
      .EXPO_PUBLIC_PAYMONGO_PUBLIC_KEY;

  if (
    typeof publicKey !==
      'string' ||
    !publicKey.trim()
  ) {
    throw new Error(
      'EXPO_PUBLIC_PAYMONGO_PUBLIC_KEY is missing from the Expo environment.',
    );
  }

  return publicKey.trim();
}

function base64Encode(
  value,
) {
  if (
    typeof globalThis.btoa ===
    'function'
  ) {
    return globalThis.btoa(
      value,
    );
  }

  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

  let output = '';

  let i = 0;

  while (
    i < value.length
  ) {
    const chr1 =
      value.charCodeAt(i++);

    const chr2 =
      value.charCodeAt(i++);

    const chr3 =
      value.charCodeAt(i++);

    const enc1 =
      chr1 >> 2;

    const enc2 =
      ((chr1 & 3) << 4) |
      (chr2 >> 4);

    const enc3 =
      Number.isNaN(chr2)
        ? 64
        : ((chr2 & 15) << 2) |
          (chr3 >> 6);

    const enc4 =
      Number.isNaN(chr3)
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

async function paymongoCreateQrPhPaymentMethod() {
  const publicKey =
    getPaymongoPublicKey();

  const response =
    await fetch(
      'https://api.paymongo.com/v1/payment_methods',
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/json',

          Authorization:
            `Basic ${base64Encode(
              `${publicKey}:`,
            )}`,
        },

        body: JSON.stringify({
          data: {
            attributes: {
              type: 'qrph',

              /*
               * QR Ph supports a configurable lifetime. 1800 seconds
               * is 30 minutes, matching PayMongo's documented default.
               */
              expiry_seconds:
                QRPH_EXPIRY_SECONDS,
            },
          },
        }),
      },
    );

  const responseText =
    await response.text();

  let json;

  try {
    json =
      JSON.parse(
        responseText,
      );
  } catch {
    throw new Error(
      `PayMongo returned an invalid response while creating the QRPh payment method (HTTP ${response.status}).`,
    );
  }

  if (
    !response.ok
  ) {
    const detail =
      json?.errors?.[0]
        ?.detail ||
      json?.error ||
      'Unable to create the QRPh payment method.';

    throw new Error(
      detail,
    );
  }

  const paymentMethodId =
    json?.data?.id;

  if (
    !paymentMethodId
  ) {
    throw new Error(
      'PayMongo did not return a QRPh payment method ID.',
    );
  }

  return {
    id: paymentMethodId,

    raw: json,
  };
}

async function paymongoAttachQrPhPaymentMethod({
  paymentIntentId,
  clientKey,
  paymentMethodId,
}) {
  const publicKey =
    getPaymongoPublicKey();

  const response =
    await fetch(
      `https://api.paymongo.com/v1/payment_intents/${encodeURIComponent(
        paymentIntentId,
      )}/attach`,
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/json',

          Authorization:
            `Basic ${base64Encode(
              `${publicKey}:`,
            )}`,
        },

        body: JSON.stringify({
          data: {
            attributes: {
              payment_method:
                paymentMethodId,

              client_key:
                clientKey,
            },
          },
        }),
      },
    );

  const responseText =
    await response.text();

  let json;

  try {
    json =
      JSON.parse(
        responseText,
      );
  } catch {
    throw new Error(
      `PayMongo returned an invalid response while attaching the QRPh payment method (HTTP ${response.status}).`,
    );
  }

  if (
    !response.ok
  ) {
    const detail =
      json?.errors?.[0]
        ?.detail ||
      json?.error ||
      'Unable to start the QRPh payment.';

    throw new Error(
      detail,
    );
  }

  return json;
}

export function usePaymentFlow(
  billId,
  grandTotal,
  customer,
) {
  const normalizedBillId =
    normalizeId(
      billId,
    );

  const [
    state,
    setState,
  ] = useState({
    paying: false,

    paymentIntentId:
      null,

    referenceNumber:
      null,

    selectedPaymentMethod:
      null,

    verifiedPaid:
      false,

    verifying:
      false,

    paymentError:
      null,

    qrImageUrl:
      null,

    qrTestUrl:
      null,

    qrExpiresAt:
      null,

    qrPaymentVisible:
      false,
  });

  const paymentIntentIdRef =
    useRef(null);

  const qrPaymentFlowStartedRef =
    useRef(false);

  const qrMonitorTimerRef =
    useRef(null);

  const qrMonitorRunningRef =
    useRef(false);

  const stopQrMonitoring =
    useCallback(
      () => {
        if (
          qrMonitorTimerRef.current
        ) {
          clearInterval(
            qrMonitorTimerRef.current,
          );

          qrMonitorTimerRef.current =
            null;
        }

        qrMonitorRunningRef.current =
          false;
      },
      [],
    );

  /*
   * ================================================================
   * CHECK CURRENT FINAL COST STATUS
   * ================================================================
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
          setState(
            prev => ({
              ...prev,
              verifying:
                true,
            }),
          );
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
            stopQrMonitoring();

            setState(
              prev => ({
                ...prev,

                verifiedPaid:
                  true,

                verifying:
                  false,

                paymentError:
                  null,

                qrPaymentVisible:
                  false,

                qrImageUrl:
                  null,

                qrTestUrl:
                  null,
              }),
            );

            return 'PAID';
          }

          return currentStatus;
        } catch (
          error
        ) {
          console.error(
            '[PaymentFlow] Final Cost status check failed:',
            error,
          );

          return null;
        } finally {
          if (showLoading) {
            setState(
              prev => ({
                ...prev,
                verifying:
                  false,
              }),
            );
          }
        }
      },
      [
        normalizedBillId,
        stopQrMonitoring,
      ],
    );

  /*
   * ================================================================
   * VERIFY PAYMENT INTENT SERVER-SIDE
   * ================================================================
   */

  const verifyPaymentIntent =
    useCallback(
      async (
        paymentIntentId,
        showLoading = true,
        silent = false,
      ) => {
        if (
          !normalizedBillId ||
          !paymentIntentId
        ) {
          return false;
        }

        if (showLoading) {
          setState(
            prev => ({
              ...prev,
              verifying:
                true,
            }),
          );
        }

        try {
          const response =
            await paymentsApi.verifyPayment(
              normalizedBillId,
              paymentIntentId,
            );

          const responseError =
            extractApiError(
              response,
            );

          if (
            responseError
          ) {
            throw new Error(
              responseError,
            );
          }

          const verificationData =
            extractVerificationData(
              response,
            );

          const paid =
            verificationData?.paid ===
              true ||
            response?.paid ===
              true;

          const referenceNumber =
            verificationData?.referenceNumber ??
            response?.referenceNumber ??
            null;

          if (paid) {
            stopQrMonitoring();

            qrPaymentFlowStartedRef.current =
              false;

            setState(
              prev => ({
                ...prev,

                verifiedPaid:
                  true,

                verifying:
                  false,

                referenceNumber:
                  referenceNumber ??
                  prev.referenceNumber,

                paymentError:
                  null,

                qrPaymentVisible:
                  false,

                qrImageUrl:
                  null,

                qrTestUrl:
                  null,
              }),
            );

            return true;
          }

          return false;
        } catch (
          error
        ) {
          console.error(
            '[PaymentFlow] Payment Intent verification failed:',
            error,
          );

          if (!silent) {
            setState(
              prev => ({
                ...prev,

                paymentError:
                  error?.message ||
                  'Unable to verify the payment.',
              }),
            );
          }

          return false;
        } finally {
          if (showLoading) {
            setState(
              prev => ({
                ...prev,
                verifying:
                  false,
              }),
            );
          }
        }
      },
      [
        normalizedBillId,
        stopQrMonitoring,
      ],
    );

  /*
   * ================================================================
   * REALTIME FINAL COST STATUS
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
          '[PaymentFlow] Realtime Final Cost update:',
          normalizedStatus,
        );

        if (
          normalizedStatus ===
          'PAID'
        ) {
          stopQrMonitoring();

          qrPaymentFlowStartedRef.current =
            false;

          setState(
            prev => ({
              ...prev,

              verifiedPaid:
                true,

              verifying:
                false,

              paymentError:
                null,

              qrPaymentVisible:
                false,

              qrImageUrl:
                null,

              qrTestUrl:
                null,
            }),
          );
        }
      },
      [
        stopQrMonitoring,
      ],
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

  useEffect(
    () => {
      void fetchCurrentStatus(
        false,
      );
    },
    [
      fetchCurrentStatus,
    ],
  );

  /*
   * ================================================================
   * RESET BILL-SPECIFIC STATE
   * ================================================================
   */

  useEffect(
    () => {
      stopQrMonitoring();

      paymentIntentIdRef.current =
        null;

      qrPaymentFlowStartedRef.current =
        false;

      setState({
        paying: false,

        paymentIntentId:
          null,

        referenceNumber:
          null,

        selectedPaymentMethod:
          null,

        verifiedPaid:
          false,

        verifying:
          false,

        paymentError:
          null,

        qrImageUrl:
          null,

        qrTestUrl:
          null,

        qrExpiresAt:
          null,

        qrPaymentVisible:
          false,
      });
    },
    [
      normalizedBillId,
      stopQrMonitoring,
    ],
  );

  /*
   * ================================================================
   * QRPH COMPLETION MONITOR
   *
   * Realtime is used as the live UI channel when available.
   * Because webhook delivery can be unavailable/configured later,
   * this hook also asks AutoCare's server to verify the Payment Intent
   * every few seconds while the QR payment is active.
   *
   * The server, not the mobile app, talks to PayMongo with the secret key.
   * ================================================================
   */

  const startQrMonitoring =
    useCallback(
      paymentIntentId => {
        if (
          !normalizedBillId ||
          !paymentIntentId ||
          qrMonitorRunningRef.current ||
          state.verifiedPaid
        ) {
          return;
        }

        stopQrMonitoring();

        qrMonitorRunningRef.current =
          true;

        let attempts = 0;

        const check =
          async () => {
            attempts += 1;

            const paid =
              await verifyPaymentIntent(
                paymentIntentId,
                false,
                true,
              );

            if (
              paid
            ) {
              stopQrMonitoring();

              return;
            }

            const currentStatus =
              await fetchCurrentStatus(
                false,
              );

            if (
              currentStatus ===
              'PAID'
            ) {
              stopQrMonitoring();

              return;
            }

            if (
              attempts >=
              QRPH_MAX_POLL_ATTEMPTS
            ) {
              stopQrMonitoring();

              setState(
                prev => ({
                  ...prev,

                  paymentError:
                    'The QR payment session expired or could not be confirmed. You can start a new payment.',
                }),
              );

              return;
            }
          };

        void check();

        qrMonitorTimerRef.current =
          setInterval(
            () => {
              void check();
            },
            QRPH_POLL_INTERVAL_MS,
          );
      },
      [
        normalizedBillId,
        state.verifiedPaid,
        stopQrMonitoring,
        verifyPaymentIntent,
        fetchCurrentStatus,
      ],
    );

  /*
   * ================================================================
   * CREATE QRPH PAYMENT
   * ================================================================
   */

  const startPayment =
    useCallback(
      async paymentMethod => {
        if (
          !normalizedBillId
        ) {
          Alert.alert(
            'Payment Error',
            'Invalid Final Cost ID.',
          );

          return false;
        }

        if (
          paymentMethod !==
          'qrph'
        ) {
          Alert.alert(
            'Payment Error',
            'Only QRPh is currently available for online payment.',
          );

          return false;
        }

        if (
          state.paying ||
          state.verifying
        ) {
          return false;
        }

        const amount =
          Number.parseFloat(
            String(
              grandTotal ?? 0,
            ),
          ) || 0;

        if (
          amount <= 0
        ) {
          Alert.alert(
            'Payment Error',
            'Invalid payment amount.',
          );

          return false;
        }

        const currentStatus =
          await finalBillsApi
            .getStatus(
              normalizedBillId,
            )
            .then(
              extractStatus,
            )
            .catch(
              error => {
                console.warn(
                  '[PaymentFlow] Pre-payment status check failed:',
                  error,
                );

                return null;
              },
            );

        if (
          currentStatus ===
          'PAID'
        ) {
          setState(
            prev => ({
              ...prev,

              verifiedPaid:
                true,
            }),
          );

          return true;
        }

        setState(
          prev => ({
            ...prev,

            paying:
              true,

            paymentError:
              null,

            selectedPaymentMethod:
              'qrph',
          }),
        );

        qrPaymentFlowStartedRef.current =
          false;

        stopQrMonitoring();

        try {
          const intentResponse =
            await paymentsApi.createPaymentIntent(
              normalizedBillId,
              'qrph',
            );

          const apiError =
            extractApiError(
              intentResponse,
            );

          if (
            apiError
          ) {
            throw new Error(
              apiError,
            );
          }

          const paymentIntentData =
            extractPaymentIntentData(
              intentResponse,
            );

          if (
            !paymentIntentData
          ) {
            throw new Error(
              'PayMongo Payment Intent was not returned by the server.',
            );
          }

          const paymentIntentId =
            getPaymentIntentId(
              paymentIntentData,
            );

          const clientKey =
            getPaymentIntentClientKey(
              paymentIntentData,
            );

          if (
            !paymentIntentId ||
            !clientKey
          ) {
            throw new Error(
              'PayMongo did not return the credentials needed to create the QRPh payment.',
            );
          }

          paymentIntentIdRef.current =
            paymentIntentId;

          setState(
            prev => ({
              ...prev,

              paymentIntentId,

              paymentError:
                null,
            }),
          );

          const paymentMethodResource =
            await paymongoCreateQrPhPaymentMethod();

          const attached =
            await paymongoAttachQrPhPaymentMethod(
              {
                paymentIntentId,
                clientKey,
                paymentMethodId:
                  paymentMethodResource.id,
              },
            );

          const attachedData =
            attached?.data ??
            attached;

          const status =
            getPaymentIntentStatus(
              attachedData,
            );

          const normalizedStatus =
            String(
              status ?? '',
            )
              .trim()
              .toLowerCase();

          const qrImageUrl =
            getQrImageUrl(
              attachedData,
            );

          const qrTestUrl =
            getQrPhTestUrl(
              attachedData,
            );

          if (
            normalizedStatus ===
            'succeeded'
          ) {
            return await verifyPaymentIntent(
              paymentIntentId,
              true,
            );
          }

          if (
            !qrImageUrl
          ) {
            throw new Error(
              'PayMongo did not return a QRPh image for this payment.',
            );
          }

          if (
            normalizedStatus !==
              'awaiting_next_action' &&
            normalizedStatus !==
              'processing'
          ) {
            throw new Error(
              `The QRPh payment is in an unexpected state: ${
                normalizedStatus ||
                'unknown'
              }.`,
            );
          }

          qrPaymentFlowStartedRef.current =
            true;

          setState(
            prev => ({
              ...prev,

              paying:
                false,

              verifying:
                false,

              qrImageUrl,

              qrTestUrl,

              qrExpiresAt:
                Date.now() +
                QRPH_EXPIRY_SECONDS *
                  1000,

              qrPaymentVisible:
                true,

              paymentError:
                null,
            }),
          );

          startQrMonitoring(
            paymentIntentId,
          );

          return true;
        } catch (
          error
        ) {
          qrPaymentFlowStartedRef.current =
            false;

          console.error(
            '[PaymentFlow] QRPh payment creation error:',
            error,
          );

          const message =
            error?.message ||
            'Could not initiate the QRPh payment.';

          setState(
            prev => ({
              ...prev,

              paymentError:
                message,
            }),
          );

          Alert.alert(
            'Payment Error',
            message,
          );

          return false;
        } finally {
          setState(
            prev => ({
              ...prev,

              paying:
                false,
            }),
          );
        }
      },
      [
        normalizedBillId,
        grandTotal,
        state.paying,
        state.verifying,
        stopQrMonitoring,
        verifyPaymentIntent,
        startQrMonitoring,
      ],
    );

  /*
   * ================================================================
   * MANUAL STATUS CHECK
   * ================================================================
   */

  const checkPaymentNow =
    useCallback(
      async () => {
        if (
          !normalizedBillId
        ) {
          return false;
        }

        const paymentIntentId =
          paymentIntentIdRef.current ??
          state.paymentIntentId;

        if (
          paymentIntentId
        ) {
          const paid =
            await verifyPaymentIntent(
              paymentIntentId,
              true,
              false,
            );

          if (
            paid
          ) {
            return true;
          }
        }

        const currentStatus =
          await fetchCurrentStatus(
            true,
          );

        if (
          currentStatus ===
          'PAID'
        ) {
          return true;
        }

        return false;
      },
      [
        normalizedBillId,
        state.paymentIntentId,
        verifyPaymentIntent,
        fetchCurrentStatus,
      ],
    );

  /*
   * ================================================================
   * CLOSE QR MODAL
   * ================================================================
   */

  const closeQrPayment =
    useCallback(
      () => {
        setState(
          prev => ({
            ...prev,

            qrPaymentVisible:
              false,
          }),
        );
      },
      [],
    );

  /*
   * ================================================================
   * APP ACTIVE RECOVERY
   * ================================================================
   */

  useEffect(
    () => {
      const subscription =
        AppState.addEventListener(
          'change',
          nextState => {
            if (
              nextState !==
              'active'
            ) {
              return;
            }

            if (
              !normalizedBillId ||
              state.verifiedPaid
            ) {
              return;
            }

            if (
              !qrPaymentFlowStartedRef.current &&
              !state.qrPaymentVisible
            ) {
              return;
            }

            void checkPaymentNow();
          },
        );

      return () => {
        subscription.remove();
      };
    },
    [
      normalizedBillId,
      state.verifiedPaid,
      state.qrPaymentVisible,
      checkPaymentNow,
    ],
  );

  /*
   * ================================================================
   * FOCUS RECOVERY
   * ================================================================
   */

  useFocusEffect(
    useCallback(
      () => {
        if (
          !normalizedBillId ||
          state.verifiedPaid
        ) {
          return undefined;
        }

        if (
          !qrPaymentFlowStartedRef.current &&
          !state.qrPaymentVisible
        ) {
          return undefined;
        }

        void checkPaymentNow();

        return undefined;
      },
      [
        normalizedBillId,
        state.verifiedPaid,
        state.qrPaymentVisible,
        checkPaymentNow,
      ],
    ),
  );

  /*
   * ================================================================
   * FINAL CLEANUP
   * ================================================================
   */

  useEffect(
    () => {
      return () => {
        stopQrMonitoring();
      };
    },
    [
      stopQrMonitoring,
    ],
  );

  return {
    startPayment,

    payWithCard:
      undefined,

    paying:
      state.paying,

    paymentIntentId:
      state.paymentIntentId,

    referenceNumber:
      state.referenceNumber,

    selectedPaymentMethod:
      state.selectedPaymentMethod,

    verifiedPaid:
      state.verifiedPaid,

    verifying:
      state.verifying,

    paymentError:
      state.paymentError,

    qrImageUrl:
      state.qrImageUrl,

    qrTestUrl:
      state.qrTestUrl,

    qrExpiresAt:
      state.qrExpiresAt,

    qrPaymentVisible:
      state.qrPaymentVisible,

    closeQrPayment,

    checkPaymentNow,
  };
}
