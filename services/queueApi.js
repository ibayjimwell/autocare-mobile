import api from './api';

const queueApi = {
  /**
   * Get the service queue for a specific date.
   * @param {string} date - YYYY-MM-DD
   * @returns {Promise}
   */
  getQueue: (date) => {
    return api.request(`/queue?date=${date}`, 'GET', null, true);
  },
};

export default queueApi;