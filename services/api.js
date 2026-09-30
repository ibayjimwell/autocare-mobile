import { storage } from '../utils/storage';

export const API_BASE_URL = 'https://autocare-system.vercel.app/api';

async function parseJsonResponse(response) {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      error: true,
      errorMessage: `The server returned an invalid response (${response.status}).`,
    };
  }
}

const api = {
  async request(endpoint, method = 'GET', body = null, requiresAuth = false) {
    const headers = {
      Accept: 'application/json',
    };

    if (!(body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    if (requiresAuth) {
      // storage.getItem is asynchronous. The old implementation was using
      // the Promise itself as the Authorization token.
      const token = await storage.getItem('auth_token');

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    let url = `${API_BASE_URL}${endpoint}`;

    if (method === 'GET') {
      const separator = url.includes('?') ? '&' : '?';
      url += `${separator}_t=${Date.now()}`;
    }

    const options = {
      method,
      headers,
    };

    if (body !== null && body !== undefined) {
      options.body = body instanceof FormData ? body : JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await parseJsonResponse(response);

    if (!response.ok) {
      const error = new Error(
        data?.errorMessage ||
          data?.message ||
          `Request failed with status ${response.status}.`,
      );

      error.status = response.status;
      error.errorType = data?.errorType;
      error.errorTitle = data?.errorTitle;
      error.responseData = data;

      throw error;
    }

    return data;
  },
};

export default api;
