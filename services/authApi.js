import api from './api';
import { storage } from '../utils/storage';
import { decodeToken } from '../utils/jwt';

const authApi = {
  // Signup – backend expects FormData
  register(userData) {
    const form = new FormData();
    form.append('fullname', userData.fullname);
    form.append('email', userData.email);
    form.append('phone', userData.phone);
    form.append('password', userData.password);
    form.append('tempPassword', false);
    
    return api.request('/customers', 'POST', form);
  },

  // Login – JSON (unchanged)
  login(credentials) {
    return api.request('/customers/login', 'POST', credentials);
  },

  // Get current customer
  async getMe() {
    const token = storage.getItem('auth_token');
    if (!token) throw new Error('Not authenticated');

    const decoded = decodeToken(token);
    if (!decoded || !decoded.id) throw new Error('Invalid token');

    return api.request(`/customers/${decoded.id}`, 'GET');
  },
};

export default authApi;