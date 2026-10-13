import api from './api';

/** Endpoints authenticate using the current customer's stored JWT. */
const arrivalRequestsApi = {
  pending: () => api.request('/queue/arrival-pending', 'GET', null, true),
  respond: (appointmentId, requestAt, response) =>
    api.request(`/queue/${encodeURIComponent(appointmentId)}/arrival-response`, 'POST', {
      requestAt,
      response,
    }, true),
};

export default arrivalRequestsApi;
