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
     
     CUSTOMER-SIDE CANCELLATION
     
     PENDING and CONFIRMED appointments can be cancelled from
     the mobile app.
     
     `changedBy` is the authenticated customer's user ID.
     
     The backend validates that the customer actually owns the
     appointment before allowing the cancellation.
  ============================================================== */

  cancel: (
    id,
    reason = '',
    changedBy = null,
  ) =>
    api.request(
      `/appointments/${id}/status`,
      'PATCH',
      {
        status:
          'CANCELLED',

        reason:
          reason,

        changedBy:
          changedBy,
      },
      true,
    ),

  /* ==============================================================
     AVAILABLE SLOTS
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
     
     DEPRECATED.
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

            emptyResponse:
              true,
          };
        }

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

export default appointmentsApi;