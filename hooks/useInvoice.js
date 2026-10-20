import {
  useState,
  useEffect,
} from 'react';

import finalBillsApi from '../services/finalBillsApi';
import appointmentsApi from '../services/appointmentsApi';

function normalizeBillId(value) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function extractInvoiceData(response) {
  if (!response) {
    return null;
  }

  /*
   * Normal API response:
   *
   * {
   *   error: false,
   *   message: "...",
   *   data: {...}
   * }
   */
  if (
    response.data !== undefined &&
    response.data !== null
  ) {
    return response.data;
  }

  /*
   * Also support an API wrapper that returns the actual
   * final-bill object directly.
   */
  if (
    response.id ||
    response.finalBillId
  ) {
    return response;
  }

  return null;
}

function extractApiError(response) {
  if (!response) {
    return null;
  }

  if (
    typeof response.errorMessage ===
      'string' &&
    response.errorMessage.trim()
  ) {
    return response.errorMessage;
  }

  if (
    typeof response.message ===
      'string' &&
    response.error === true
  ) {
    return response.message;
  }

  return null;
}

export function useInvoice(billId) {
  const [data, setData] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  useEffect(() => {
    const normalizedBillId =
      normalizeBillId(billId);

    let cancelled = false;

    if (!normalizedBillId) {
      setData(null);
      setError('Invalid Final Cost ID.');
      setLoading(false);

      return () => {
        cancelled = true;
      };
    }

    const loadInvoice =
      async () => {
        setLoading(true);
        setError(null);

        try {
          const response =
            await finalBillsApi.getById(
              normalizedBillId,
            );

          if (cancelled) {
            return;
          }

          /*
           * Some API wrappers throw on non-2xx responses,
           * while others return { error: true }.
           *
           * Handle both cases.
           */
          const apiError =
            extractApiError(response);

          if (apiError) {
            throw new Error(
              apiError,
            );
          }

          const invoiceData =
            extractInvoiceData(
              response,
            );

          if (!invoiceData) {
            throw new Error(
              'Final Cost data was not returned.',
            );
          }

          /*
           * The Final Cost detail endpoint includes the financial bill,
           * findings, work tasks, fees and discounts, but not necessarily
           * the complete appointment relationship or its booked services.
           *
           * Fetch the existing appointment detail ONLY for presentation.
           * This does not update or recalculate any Final Cost amount,
           * payment status, PayMongo state, or transaction data.
           */
          let hydratedInvoice = invoiceData;
          const appointmentId =
            invoiceData.appointmentId ||
            invoiceData.appointment?.id ||
            invoiceData.estimate?.appointmentId;

          if (appointmentId) {
            try {
              const appointmentResponse =
                await appointmentsApi.get(appointmentId);

              if (cancelled) {
                return;
              }

              const appointmentError =
                extractApiError(appointmentResponse);

              if (!appointmentError) {
                const appointmentData =
                  appointmentResponse?.data ?? appointmentResponse;
                const resolvedAppointment = Array.isArray(appointmentData)
                  ? appointmentData[0]
                  : appointmentData;

                if (resolvedAppointment?.id) {
                  hydratedInvoice = {
                    ...invoiceData,
                    appointment: {
                      ...(invoiceData.appointment || {}),
                      ...resolvedAppointment,
                      customer: {
                        ...(invoiceData.appointment?.customer || {}),
                        ...(resolvedAppointment.customer || {}),
                      },
                      vehicle: {
                        ...(invoiceData.appointment?.vehicle || {}),
                        ...(resolvedAppointment.vehicle || {}),
                      },
                      services:
                        Array.isArray(resolvedAppointment.services) &&
                        resolvedAppointment.services.length > 0
                          ? resolvedAppointment.services
                          : invoiceData.appointment?.services || [],
                    },
                  };
                }
              } else {
                console.warn(
                  '[useInvoice] Appointment detail was unavailable:',
                  appointmentError,
                );
              }
            } catch (appointmentError) {
              // A temporary appointment lookup failure must not prevent
              // customers from viewing or paying an otherwise valid bill.
              console.warn(
                '[useInvoice] Failed to hydrate booked services:',
                appointmentError,
              );
            }
          }

          if (cancelled) {
            return;
          }

          setData(hydratedInvoice);
          setError(null);
        } catch (err) {
          if (cancelled) {
            return;
          }

          console.error(
            '[useInvoice] Failed to load Final Cost:',
            err,
          );

          setData(null);

          setError(
            err?.message ||
              'Unable to fetch Final Cost.',
          );
        } finally {
          if (!cancelled) {
            /*
             * This guarantees the screen never remains
             * permanently stuck on the loading spinner.
             */
            setLoading(false);
          }
        }
      };

    loadInvoice();

    return () => {
      cancelled = true;
    };
  }, [billId]);

  return {
    invoice: data,
    loading,
    error,
  };
}