import api from "./api";

const customersApi = {
  getVehiclesByCustomer(customerId) {
    return api.request(
      `/vehicles/customer/${customerId}`,
      "GET",
      null,
      true
    );
  },

  getCustomerAppointments(customerId) {
    return api.request(
      `/customers/${customerId}/appointments`,
      "GET",
      null,
      true
    );
  },

  getStats(customerId) {
    return api.request(
      `/customers/${customerId}/stats`,
      "GET",
      null,
      true
    );
  },

  getAppointmentHistory(customerId) {
    return api.request(
      `/customers/${customerId}/appointments-history`,
      "GET",
      null,
      true
    );
  },

  getMe() {
    return api.request(
      "/auth/me",
      "GET",
      null,
      true
    );
  },

  updatePresence(customerId, isOnline) {
    return api.request(
      `/customers/${customerId}/presence`,
      "PUT",
      {
        isOnline,
      },
      true
    );
  },
};

export default customersApi;