import { storage } from '../utils/storage';

export const API_BASE_URL = 'http://192.168.1.9:3000/api';

const api = {
  async request(endpoint, method = 'GET', body = null, requiresAuth = false) {
    const headers = {};

    if (!(body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    if (requiresAuth) {
      const token = storage.getItem('auth_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    let url = `${API_BASE_URL}${endpoint}`;
    if (method === 'GET') {
      const separator = url.includes('?') ? '&' : '?';
      url += `${separator}_t=${Date.now()}`;
    }

    const options = { method, headers };
    if (body) {
      options.body = body instanceof FormData ? body : JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json();
    if (!response.ok) {
      // Backend errors: { error: true, errorMessage: '...' }
      const errorMsg = data.errorMessage || data.message || 'Something went wrong';
      throw new Error(errorMsg);
    }
    return data;
  },
};

export default api;