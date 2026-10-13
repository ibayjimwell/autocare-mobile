
import api from './api';

import {
  storage,
} from '../utils/storage';

import {
  decodeToken,
} from '../utils/jwt';

const authApi = {
  // REGISTER
  register(userData) {
    const form = new FormData();

    form.append(
      'fullname',
      userData.fullname,
    );

    form.append(
      'email',
      userData.email || '',
    );

    form.append(
      'phone',
      userData.phone,
    );

    form.append(
      'password',
      userData.password,
    );

    form.append(
      'tempPassword',
      'false',
    );

    return api.request(
      '/customers',
      'POST',
      form,
    );
  },

  // LOGIN
  login(credentials) {
    return api.request(
      '/customers/login',
      'POST',
      credentials,
    );
  },

  // FIRST LOGIN — CHANGE TEMPORARY PASSWORD
  //
  // The login token is not persisted in normal
  // session storage before the password is changed.
  changeTemporaryPassword({
    loginToken,
    currentPassword,
    newPassword,
    confirmPassword,
  }) {
    return api.request(
      '/customers/change-temporary-password',
      'POST',
      {
        loginToken,
        currentPassword,
        newPassword,
        confirmPassword,
      },
    );
  },

  // GET CURRENT CUSTOMER
  async getMe() {
    const token =
      storage.getItem(
        'auth_token',
      );

    if (!token) {
      throw new Error(
        'Not authenticated',
      );
    }

    const decoded =
      decodeToken(token);

    if (!decoded?.id) {
      throw new Error(
        'Invalid token',
      );
    }

    return api.request(
      `/customers/${encodeURIComponent(
        decoded.id,
      )}`,
      'GET',
    );
  },

  // FORGOT PASSWORD
  requestOTP(phone) {
    return api.request(
      '/customers/forgot-password',
      'POST',
      {
        phone,
      },
    );
  },

  verifyOTP(phone, otp) {
    return api.request(
      '/customers/verify-otp',
      'POST',
      {
        phone,
        otp,
      },
    );
  },

  resetPassword(
    resetToken,
    newPassword,
  ) {
    return api.request(
      '/customers/reset-password',
      'POST',
      {
        resetToken,
        newPassword,
      },
    );
  },

  // PHONE VERIFICATION
  sendPhoneVerificationOTP(
    customerId,
    newPhone,
  ) {
    return api.request(
      '/customers/verify-phone/send-otp',
      'POST',
      {
        customerId,
        newPhone,
      },
    );
  },

  verifyPhoneOTP(
    customerId,
    otp,
    newPhone,
  ) {
    return api.request(
      '/customers/verify-phone',
      'POST',
      {
        customerId,
        otp,
        newPhone,
      },
    );
  },
};

export default authApi;
