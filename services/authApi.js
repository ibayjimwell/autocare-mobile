import api from './api';

import {
  storage,
} from '../utils/storage';

import {
  decodeToken,
} from '../utils/jwt';

const authApi = {
  // ------------------------------------------------------------------
  // REGISTER
  //
  // Backend expects FormData.
  //
  // Email is optional.
  // ------------------------------------------------------------------

  register(
    userData
  ) {
    const form =
      new FormData();

    form.append(
      'fullname',
      userData.fullname
    );

    /*
     * FormData converts null into the string "null".
     *
     * Because email is optional, always send an empty string when
     * there is no email. The backend converts the empty string to
     * NULL.
     */
    form.append(
      'email',
      userData.email ||
        ''
    );

    form.append(
      'phone',
      userData.phone
    );

    form.append(
      'password',
      userData.password
    );

    form.append(
      'tempPassword',
      false
    );

    return api.request(
      '/customers',
      'POST',
      form
    );
  },

  // ------------------------------------------------------------------
  // LOGIN
  //
  // Backend expects:
  //
  // {
  //   emailOrPhone,
  //   password
  // }
  //
  // The backend may return:
  //
  // 200
  //   Login successful
  //
  // 200
  //   Phone verification required
  //
  // 401
  //   Invalid credentials
  //
  // 403
  //   Account deactivated
  //
  // We intentionally return the API response directly so the auth
  // context can handle each state.
  // ------------------------------------------------------------------

  login(
    credentials
  ) {
    return api.request(
      '/customers/login',
      'POST',
      credentials
    );
  },

  // ------------------------------------------------------------------
  // CURRENT CUSTOMER
  // ------------------------------------------------------------------

  async getMe() {
    const token =
      storage.getItem(
        'auth_token'
      );

    if (!token) {
      throw new Error(
        'Not authenticated'
      );
    }

    const decoded =
      decodeToken(
        token
      );

    if (
      !decoded ||
      !decoded.id
    ) {
      throw new Error(
        'Invalid token'
      );
    }

    return api.request(
      `/customers/${decoded.id}`,
      'GET'
    );
  },

  // ------------------------------------------------------------------
  // FORGOT PASSWORD
  // ------------------------------------------------------------------

  requestOTP(
    phone
  ) {
    return api.request(
      '/customers/forgot-password',
      'POST',
      {
        phone,
      }
    );
  },

  verifyOTP(
    phone,
    otp
  ) {
    return api.request(
      '/customers/verify-otp',
      'POST',
      {
        phone,
        otp,
      }
    );
  },

  resetPassword(
    resetToken,
    newPassword
  ) {
    return api.request(
      '/customers/reset-password',
      'POST',
      {
        resetToken,
        newPassword,
      }
    );
  },

  // ------------------------------------------------------------------
  // PHONE VERIFICATION
  // ------------------------------------------------------------------

  sendPhoneVerificationOTP(
    customerId,
    newPhone
  ) {
    return api.request(
      '/customers/verify-phone/send-otp',
      'POST',
      {
        customerId,
        newPhone,
      }
    );
  },

  // ------------------------------------------------------------------
  // VERIFY PHONE OTP
  // ------------------------------------------------------------------

  verifyPhoneOTP: (
    customerId,
    otp,
    newPhone
  ) => {
    return api.request(
      '/customers/verify-phone',
      'POST',
      {
        customerId,
        otp,
        newPhone,
      }
    );
  },
};

export default authApi;