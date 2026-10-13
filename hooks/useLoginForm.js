
import {
  useRef,
  useState,
} from 'react';

import {
  router,
} from 'expo-router';

import {
  useAuth,
} from '../context/AuthContext';

import authApi from '../services/authApi';

import {
  loginSchema,
} from '../utils/validation';

function errorMessage(
  error,
  fallback,
) {
  return (
    error?.errorMessage ||
    error?.response?.data?.errorMessage ||
    error?.message ||
    fallback
  );
}

function isDeactivated(error) {
  const status =
    error?.status ??
    error?.statusCode ??
    error?.response?.status;

  const title =
    error?.errorTitle ??
    error?.response?.data?.errorTitle;

  const message =
    errorMessage(error, '')
      .toLowerCase();

  return (
    status === 403 ||
    title === 'Account deactivated' ||
    message.includes(
      'account is deactivated',
    )
  );
}

export function useLoginForm() {
  const {
    setSession,
  } = useAuth();

  // FORM
  const [
    emailOrPhone,
    setEmailOrPhone,
  ] = useState('');

  const [
    password,
    setPassword,
  ] = useState('');

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    errors,
    setErrors,
  ] = useState({});

  const [
    loginError,
    setLoginError,
  ] = useState('');

  // DEACTIVATED ACCOUNT
  const [
    deactivatedModalVisible,
    setDeactivatedModalVisible,
  ] = useState(false);

  // TEMPORARY PASSWORD
  const [
    tempPasswordModalVisible,
    setTempPasswordModalVisible,
  ] = useState(false);

  const [
    changingPassword,
    setChangingPassword,
  ] = useState(false);

  const [
    tempPasswordError,
    setTempPasswordError,
  ] = useState('');

  // Store pending credentials in memory only.
  // Never save the original temporary password
  // or temporary login token in persistent storage.
  const pendingLoginRef =
    useRef(null);

  function handleFieldChange(
    field,
    value,
  ) {
    if (
      field === 'emailOrPhone'
    ) {
      setEmailOrPhone(value);
    }

    if (
      field === 'password'
    ) {
      setPassword(value);
    }

    setErrors(previous => ({
      ...previous,
      [field]: '',
    }));

    setLoginError('');
  }

  function closeDeactivatedModal() {
    setDeactivatedModalVisible(
      false,
    );
  }

  function cancelTemporaryPasswordChange() {
    if (changingPassword) {
      return;
    }

    pendingLoginRef.current =
      null;

    setTempPasswordError('');

    setTempPasswordModalVisible(
      false,
    );
  }

  // LOGIN
  async function handleLogin() {
    if (
      loading ||
      changingPassword ||
      tempPasswordModalVisible
    ) {
      return;
    }

    setLoginError('');

    setDeactivatedModalVisible(
      false,
    );

    const parsed =
      loginSchema.safeParse({
        emailOrPhone,
        password,
      });

    if (!parsed.success) {
      const nextErrors = {};

      for (
        const issue of
        parsed.error.issues
      ) {
        const key =
          issue.path?.[0];

        if (
          key &&
          !nextErrors[key]
        ) {
          nextErrors[key] =
            issue.message;
        }
      }

      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const result =
        await authApi.login({
          emailOrPhone:
            emailOrPhone.trim(),
          password,
        });

      // API ERROR
      if (result?.error) {
        if (
          isDeactivated(result)
        ) {
          setDeactivatedModalVisible(
            true,
          );
          return;
        }

        setLoginError(
          errorMessage(
            result,
            'Login failed. Please try again.',
          ),
        );

        return;
      }

      // TEMPORARY PASSWORD FIRST, even if phone is unverified.
      // The backend issues a short-lived password-change-only token,
      // never a normal customer session token at this stage.
      const data = result?.data || {};
      const customer = data.customer;

      if (customer?.deactivated === true) {
        setDeactivatedModalVisible(true);
        return;
      }

      if (
        data.requiresPasswordChange === true ||
        customer?.tempPassword === true
      ) {
        const temporaryToken = data.temporaryToken;

        if (!customer?.id || !temporaryToken) {
          setLoginError(
            'Unable to start your password setup. Please update the AutoCare server and try again.',
          );
          return;
        }

        pendingLoginRef.current = {
          token: temporaryToken,
          customerId: customer.id,
          currentPassword: password,
        };

        setPassword('');
        setShowPassword(false);
        setTempPasswordError('');
        setTempPasswordModalVisible(true);
        return;
      }

      // PHONE VERIFICATION SECOND (only after tempPassword=false).
      if (data.requiresVerification === true) {
        if (!data.customerId || !data.phone) {
          setLoginError('Phone verification information is missing.');
          return;
        }

        setPassword('');
        router.replace(
          `/verify-phone?customerId=${encodeURIComponent(data.customerId)}` +
          `&phone=${encodeURIComponent(data.phone)}`,
        );
        return;
      }

      // NORMAL LOGIN ONLY after both requirements are satisfied.
      const token = data.token;

      if (!customer?.id || !token) {
        setLoginError('Login response is missing customer or token.');
        return;
      }

      if (customer.tempPassword === true || customer.isPhoneVerified !== true) {
        setLoginError('Your account setup is incomplete. Please sign in again.');
        return;
      }

      // NORMAL LOGIN
      setSession(
        customer,
        token,
      );

      setPassword('');

      router.replace(
        '/(tabs)',
      );
    } catch (error) {
      if (
        isDeactivated(error)
      ) {
        setDeactivatedModalVisible(
          true,
        );
      } else {
        setLoginError(
          errorMessage(
            error,
            'Login failed. Please try again.',
          ),
        );
      }
    } finally {
      setLoading(false);
    }
  }

  // COMPLETE TEMPORARY PASSWORD CHANGE
  async function submitTemporaryPassword(
    newPassword,
    confirmPassword,
  ) {
    if (
      changingPassword
    ) {
      return false;
    }

    setTempPasswordError('');

    const pending =
      pendingLoginRef.current;

    if (!pending) {
      setTempPasswordError(
        'Temporary login expired. Please sign in again.',
      );

      return false;
    }

    // Permanent first-login passwords require at least 8 characters.
    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      setTempPasswordError('Password must be at least 8 characters.');
      return false;
    }

    if (
      !confirmPassword ||
      newPassword !==
        confirmPassword
    ) {
      setTempPasswordError(
        'Passwords do not match.',
      );

      return false;
    }

    if (
      newPassword ===
      pending.currentPassword
    ) {
      setTempPasswordError(
        'Choose a different password from the temporary password.',
      );

      return false;
    }

    setChangingPassword(true);

    try {
      const response =
        await authApi.changeTemporaryPassword({
          loginToken:
            pending.token,

          currentPassword:
            pending.currentPassword,

          newPassword,

          confirmPassword,
        });

      if (response?.error) {
        throw new Error(
          errorMessage(
            response,
            'Could not change your password.',
          ),
        );
      }

      const customer =
        response?.data?.customer;

      if (
        !customer?.id ||
        customer.id !==
          pending.customerId ||
        customer.tempPassword !==
          false
      ) {
        throw new Error(
          'The server did not confirm the password change. Please try signing in again.',
        );
      }

      const responseData = response?.data || {};
      const needsPhoneVerification =
        responseData.requiresVerification === true ||
        customer.isPhoneVerified !== true;

      // A password-change-only token must NEVER be persisted as the
      // authenticated customer token.
      if (!needsPhoneVerification && !responseData.token) {
        throw new Error(
          'The server did not issue a login token. Please sign in again.',
        );
      }

      pendingLoginRef.current = null;
      setTempPasswordModalVisible(false);
      setTempPasswordError('');
      setPassword('');
      setShowPassword(false);

      if (needsPhoneVerification) {
        const customerId = responseData.customerId || customer.id;
        const phone = responseData.phone || customer.phone;

        if (!customerId || !phone) {
          setLoginError(
            'Password updated, but phone verification information is missing. Please sign in again.',
          );
          router.replace('/(auth)/login');
          return true;
        }

        // Phone verification is the NEXT step. Still no normal session.
        router.replace(
          `/verify-phone?customerId=${encodeURIComponent(customerId)}` +
          `&phone=${encodeURIComponent(phone)}`,
        );
        return true;
      }

      setSession(customer, responseData.token);
      router.replace('/(tabs)');
      return true;
    } catch (error) {
      setTempPasswordError(
        errorMessage(
          error,
          'Could not change your password.',
        ),
      );

      return false;
    } finally {
      setChangingPassword(false);
    }
  }

  return {
    emailOrPhone,
    password,
    showPassword,
    setShowPassword,
    loading,
    errors,
    loginError,

    deactivatedModalVisible,
    closeDeactivatedModal,

    tempPasswordModalVisible,
    changingPassword,
    tempPasswordError,

    cancelTemporaryPasswordChange,
    submitTemporaryPassword,

    handleFieldChange,
    handleLogin,
  };
}
