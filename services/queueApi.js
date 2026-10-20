import api from './api';

const queueApi = {
  /**
   * Get the service queue for a specific date.
   * @param {string} date - YYYY-MM-DD
   * @returns {Promise}
   */
  getQueue: (date, mode = 'CONFIRMED') => {
    const query = new URLSearchParams({ mode });
    if (mode === 'CONFIRMED' && date) query.set('date', date);
    return api.request(`/queue?${query.toString()}`, 'GET', null, true);
  },
};

export default queueApi;