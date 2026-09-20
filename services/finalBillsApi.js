import api from './api';

function normalizeId(value) {
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }

  return value ?? '';
}

const finalBillsApi = {
  /*
   * ================================================================
   * GET BY APPOINTMENT
   * ================================================================
   */

  getByAppointment:
    appointmentId => {
      const id =
        normalizeId(
          appointmentId,
        );

      return api.request(
        `/payments/final-bills?appointmentId=${encodeURIComponent(
          id,
        )}`,
        'GET',
        null,
        true,
      );
    },

  /*
   * ================================================================
   * GET BY ID
   * ================================================================
   */

  getById: billId => {
    const id =
      normalizeId(
        billId,
      );

    return api.request(
      `/payments/final-bills/${encodeURIComponent(
        id,
      )}`,
      'GET',
      null,
      true,
    );
  },

  /*
   * ================================================================
   * LIST BY CUSTOMER
   * ================================================================
   */

  listByCustomer:
    customerId => {
      const id =
        normalizeId(
          customerId,
        );

      return api.request(
        `/payments/final-bills?customerId=${encodeURIComponent(
          id,
        )}`,
        'GET',
        null,
        true,
      );
    },

  /*
   * ================================================================
   * GET STATUS
   * ================================================================
   *
   * Used for:
   * - initial state
   * - app-focus recovery
   *
   * It is NOT used for polling.
   */

  getStatus: billId => {
    const id =
      normalizeId(
        billId,
      );

    return api.request(
      `/payments/final-bills/${encodeURIComponent(
        id,
      )}/status`,
      'GET',
      null,
      true,
    );
  },

  /*
   * ================================================================
   * UPDATE STATUS
   * ================================================================
   */

  updateStatus: (
    billId,
    status,
  ) => {
    const id =
      normalizeId(
        billId,
      );

    return api.request(
      `/payments/final-bills/${encodeURIComponent(
        id,
      )}/status`,
      'PATCH',
      {
        status,
      },
      true,
    );
  },
};

export default finalBillsApi;