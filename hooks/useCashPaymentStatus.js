import {
  useState,
  useCallback,
  useEffect,
} from 'react';

import {
  useFocusEffect,
} from 'expo-router';

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

  /*
   * api.request returns the parsed JSON object.
   *
   * Expected:
   * {
   *   error: false,
   *   message: "...",
   *   data: {
   *     status: "PAID"
   *   }
   * }
   */
  const payload =
    response?.data ??
    response;

  if (
    payload &&
    typeof payload.status ===
      'string'
  ) {
    return payload.status
      .trim()
      .toUpperCase();
  }

  if (
    payload?.data &&
    typeof payload.data.status ===
      'string'
  ) {
    return payload.data.status
      .trim()
      .toUpperCase();
  }

  return null;
}

export function useCashPaymentStatus(
  billId,
) {
  const normalizedBillId =
    normalizeId(billId);

  const [
    status,
    setStatus,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  /*
   * ---------------------------------------------------------------
   * Load current status once.
   *
   * This is NOT polling.
   *
   * Realtime is responsible for subsequent status changes.
   * ---------------------------------------------------------------
   */

  const fetchStatus =
    useCallback(
      async showLoading => {
        if (
          !normalizedBillId
        ) {
          setStatus(null);
          setLoading(false);
          return;
        }

        if (showLoading) {
          setLoading(true);
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
            currentStatus
          ) {
            setStatus(
              currentStatus,
            );
          }
        } catch (err) {
          /*
           * A failed snapshot request must not break the realtime
           * subscription. The Realtime listener remains active.
           */
          console.error(
            '[CashPaymentStatus] Initial status check failed:',
            err,
          );
        } finally {
          setLoading(false);
        }
      },
      [normalizedBillId],
    );

  /*
   * ---------------------------------------------------------------
   * Initial status
   * ---------------------------------------------------------------
   */

  useEffect(() => {
    fetchStatus(true);
  }, [fetchStatus]);

  /*
   * ---------------------------------------------------------------
   * Realtime final_bills subscription
   *
   * Exact row filter:
   *
   * id=eq.<billId>
   *
   * No timer is used.
   * ---------------------------------------------------------------
   */

  const handleRealtimeChange =
    useCallback(
      payload => {
        const nextStatus =
          payload?.new?.status ??
          payload?.record?.status;

        const previousStatus =
          payload?.old?.status;

        const currentStatus =
          typeof nextStatus ===
          'string'
            ? nextStatus
                .trim()
                .toUpperCase()
            : typeof previousStatus ===
                'string'
              ? previousStatus
                  .trim()
                  .toUpperCase()
              : null;

        if (!currentStatus) {
          return;
        }

        console.log(
          '[CashPaymentStatus] Realtime Final Cost status:',
          currentStatus,
        );

        setStatus(
          currentStatus,
        );

        if (
          currentStatus ===
          'PAID'
        ) {
          setLoading(false);
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
   * ---------------------------------------------------------------
   * Recovery check when returning to the app
   *
   * This is a single request on focus, not polling.
   * ---------------------------------------------------------------
   */

  useFocusEffect(
    useCallback(() => {
      if (
        normalizedBillId
      ) {
        fetchStatus(false);
      }
    }, [
      normalizedBillId,
      fetchStatus,
    ]),
  );

  const isPaid =
    status === 'PAID';

  return {
    status,
    loading,
    isPaid,
  };
}