import api from './api';

/* ================================================================
   APPOINTMENTS API
================================================================ */

const appointmentsApi = {
  /* ==============================================================
     LIST APPOINTMENTS
  ============================================================== */

  list: (
    params = {},
  ) => {
    const query =
      new URLSearchParams();

    if (
      params.customerId
    ) {
      query.set(
        'customerId',
        params.customerId,
      );
    }

    if (
      params.status
    ) {
      query.set(
        'status',
        params.status,
      );
    }

    const qs =
      query.toString();

    return api.request(
      `/appointments${
        qs
          ? `?${qs}`
          : ''
      }`,
      'GET',
      null,
      true,
    );
  },

  /* ==============================================================
     GET SINGLE APPOINTMENT
  ============================================================== */

  get: (
    id,
  ) =>
    api.request(
      `/appointments/${id}`,
      'GET',
      null,
      true,
    ),

  /* ==============================================================
     CREATE APPOINTMENT
     
     Backend expects FormData.
  ============================================================== */

  create: (
    data,
  ) => {
    const form =
      new FormData();

    form.append(
      'customerId',
      data.customerId,
    );

    form.append(
      'vehicleId',
      data.vehicleId,
    );

    /*
     * Backend expects services as an array.
     */
    form.append(
      'services',
      JSON.stringify(
        [
          data.serviceId,
        ],
      ),
    );

    form.append(
      'appointmentDate',
      data.appointmentDate,
    );

    form.append(
      'appointmentTime',
      data.appointmentTime,
    );

    if (
      data.notes
    ) {
      form.append(
        'notes',
        data.notes,
      );
    }

    return api.request(
      '/appointments',
      'POST',
      form,
      true,
    );
  },

  /* ==============================================================
     CANCEL APPOINTMENT
  ============================================================== */

  cancel: (
    id,
    reason = '',
  ) =>
    api.request(
      `/appointments/${id}/status`,
      'PATCH',
      {
        status:
          'CANCELLED',
        reason,
      },
      true,
    ),

  /* ==============================================================
     AVAILABLE SLOTS
     
     Existing mobile API accepts a single service ID.
  ============================================================== */

  getAvailableSlots: (
    date,
    serviceId,
  ) =>
    api.request(
      `/appointments/available-slots?date=${encodeURIComponent(
        date,
      )}&serviceIds=${encodeURIComponent(
        serviceId,
      )}`,
      'GET',
      null,
      true,
    ),

  /* ==============================================================
     CHECK AVAILABILITY
  ============================================================== */

  checkAvailability: (
    date,
    startTime,
    serviceId,
  ) =>
    api.request(
      '/appointments/check-availability',
      'POST',
      {
        date,
        startTime,
        serviceIds:
          serviceId,
      },
      true,
    ),

  /* ==============================================================
     DIRECT RESCHEDULE
     
     DEPRECATED:
     Use createRescheduleRequest() instead.
  ============================================================== */

  reschedule: (
    id,
    newDate,
    newTime,
  ) =>
    api.request(
      `/appointments/${id}`,
      'PUT',
      {
        appointmentDate:
          newDate,

        appointmentTime:
          newTime,
      },
      true,
    ),

  /* ==============================================================
     CREATE RESCHEDULE REQUEST
     
     CUSTOMER -> STAFF
     
     IMPORTANT:
     
     The backend successfully creates the request, but in the
     current environment it may return an empty HTTP response body.
     
     `api.request()` normally expects JSON. That causes:
     
       SyntaxError:
       JSON Parse error: Unexpected end of input
     
     even though the POST succeeded.
     
     We handle ONLY this specific empty-response parsing problem
     here. Other errors continue to throw normally.
  ============================================================== */

  createRescheduleRequest:
    async (
      appointmentId,
      newDate,
      newTime,
      reason,
    ) => {
      try {
        const response =
          await api.request(
            `/appointments/${appointmentId}/reschedule-request`,
            'POST',
            {
              newAppointmentDate:
                newDate,

              newAppointmentTime:
                newTime,

              reason:
                reason ||
                '',
            },
            true,
          );

        /*
         * Normal JSON response.
         */
        return (
          response || {
            error:
              false,
            data:
              null,
          }
        );
      } catch (
        error
      ) {
        /*
         * IMPORTANT:
         *
         * Only convert the parser error caused by an empty
         * successful response into success.
         *
         * Do NOT swallow normal network/API errors.
         */
        const message =
          error?.message ||
          '';

        const isEmptyJsonParseError =
          error instanceof
            SyntaxError ||
          message.includes(
            'JSON Parse error',
          ) ||
          message.includes(
            'Unexpected end of input',
          );

        if (
          isEmptyJsonParseError
        ) {
          console.warn(
            '[appointmentsApi] Reschedule request was accepted, but the server returned an empty response body.',
          );

          return {
            error:
              false,

            data:
              null,

            /*
             * Helpful diagnostic information.
             */
            emptyResponse:
              true,
          };
        }

        /*
         * Genuine error.
         */
        throw error;
      }
    },

  /* ==============================================================
     GET RESCHEDULE REQUESTS
  ============================================================== */

  getRescheduleRequests:
    (
      appointmentId,
    ) =>
      api.request(
        `/appointments/${appointmentId}/reschedule-request`,
        'GET',
        null,
        true,
      ),

  /* ==============================================================
     APPROVE RESCHEDULE REQUEST
     
     Primarily used when this endpoint is called from a client
     context that has permission to approve.
  ============================================================== */

  approveRescheduleRequest:
    (
      requestId,
    ) =>
      api.request(
        `/appointments/reschedule-request/${requestId}`,
        'PATCH',
        {
          action:
            'approve',
        },
        true,
      ),

  /* ==============================================================
     REJECT RESCHEDULE REQUEST
  ============================================================== */

  rejectRescheduleRequest:
    (
      requestId,
      rejectionReason,
    ) =>
      api.request(
        `/appointments/reschedule-request/${requestId}`,
        'PATCH',
        {
          action:
            'reject',

          rejectionReason:
            rejectionReason,
        },
        true,
      ),
};

/* ================================================================
   EXPORT
================================================================ */

export default appointmentsApi;