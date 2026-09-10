import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  router,
} from 'expo-router';

import {
  useAuth,
} from '../context/AuthContext';

import {
  signupSchema,
} from '../utils/validation';

/**
 * Normalize a Philippine mobile
 * number into:
 *
 * +639XXXXXXXXX
 */
function normalizePhilippinePhone(
  value
) {
  if (
    typeof value !==
    'string'
  ) {
    return '';
  }

  let digits =
    value.replace(
      /\D/g,
      ''
    );

  if (!digits) {
    return '';
  }

  /*
   * Remove Philippine local
   * leading zero.
   *
   * 09157803417
   *      ↓
   * 9157803417
   */
  if (
    digits.startsWith('0')
  ) {
    digits =
      digits.replace(
        /^0+/,
        ''
      );
  }

  /*
   * If user entered:
   *
   * 639157803417
   *
   * remove 63 before rebuilding.
   */
  if (
    digits.startsWith('63')
  ) {
    digits =
      digits.slice(2);
  }

  /*
   * Philippine mobile numbers
   * begin with 9 after removing
   * the local zero.
   */
  if (
    digits.startsWith('9')
  ) {
    return `+63${digits}`;
  }

  return '';
}

/**
 * Validate canonical PH mobile number.
 */
function isValidPhilippinePhone(
  value
) {
  return /^\+639\d{9}$/.test(
    value
  );
}

export function useSignUpForm() {
  const {
    register,
  } = useAuth();

  // ---------------------------------------------------------------
  // Form state
  // ---------------------------------------------------------------

  const [
    fullName,
    setFullName,
  ] = useState('');

  const [
    email,
    setEmail,
  ] = useState('');

  const [
    phone,
    setPhone,
  ] = useState('');

  const [
    password,
    setPassword,
  ] = useState('');

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState('');

  // ---------------------------------------------------------------
  // UI state
  // ---------------------------------------------------------------

  const [
    agree,
    setAgree,
  ] = useState(false);

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirm,
    setShowConfirm,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  // ---------------------------------------------------------------
  // Errors
  // ---------------------------------------------------------------

  const [
    errors,
    setErrors,
  ] = useState({});

  const [
    signupError,
    setSignupError,
  ] = useState('');

  // ---------------------------------------------------------------
  // Mounted ref
  // ---------------------------------------------------------------

  const mountedRef =
    useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current =
        false;
    };
  }, []);

  // ---------------------------------------------------------------
  // Handle field change
  // ---------------------------------------------------------------

  const handleFieldChange = (
    field,
    value
  ) => {
    switch (field) {
      case 'fullName':
        setFullName(value);
        break;

      case 'email':
        setEmail(value);
        break;

      case 'phone':
        setPhone(value);
        break;

      case 'password':
        setPassword(value);
        break;

      case 'confirmPassword':
        setConfirmPassword(
          value
        );
        break;

      default:
        break;
    }

    if (
      errors &&
      errors[field]
    ) {
      setErrors(
        prev => ({
          ...prev,
          [field]: '',
        })
      );
    }

    if (signupError) {
      setSignupError('');
    }
  };

  // ---------------------------------------------------------------
  // Signup
  // ---------------------------------------------------------------

  const handleSignup =
    async () => {
      setSignupError('');

      // -----------------------------------------------------------
      // Validate form
      // -----------------------------------------------------------

      try {
        signupSchema.parse({
          fullName,
          email,
          phone,
          password,
          confirmPassword,
        });

        setErrors({});
      } catch (
        err
      ) {
        const formattedErrors =
          {};

        if (
          err &&
          Array.isArray(
            err.issues
          )
        ) {
          err.issues.forEach(
            issue => {
              if (
                issue &&
                issue.path &&
                issue.path.length >
                  0
              ) {
                formattedErrors[
                  issue.path[0]
                ] =
                  issue.message;
              }
            }
          );
        } else {
          setSignupError(
            'Please check your information and try again.'
          );
        }

        setErrors(
          formattedErrors
        );

        return;
      }

      // -----------------------------------------------------------
      // Terms
      // -----------------------------------------------------------

      if (!agree) {
        setSignupError(
          'You must agree to the Terms of Service.'
        );

        return;
      }

      // -----------------------------------------------------------
      // Normalize phone
      // -----------------------------------------------------------

      const normalizedPhone =
        normalizePhilippinePhone(
          phone
        );

      if (
        !isValidPhilippinePhone(
          normalizedPhone
        )
      ) {
        setErrors(
          prev => ({
            ...prev,

            phone:
              'Enter a valid Philippine mobile number, e.g. 09157803417.',
          })
        );

        return;
      }

      /*
       * Update the field so the user
       * sees the canonical phone number.
       */
      setPhone(
        normalizedPhone
      );

      // -----------------------------------------------------------
      // Normalize email
      //
      // Email is optional.
      // Empty email remains empty.
      // -----------------------------------------------------------

      const normalizedEmail =
        typeof email ===
          'string' &&
        email.trim()
          ? email
              .trim()
              .toLowerCase()
          : '';

      setLoading(true);

      try {
        const result =
          await register(
            fullName,
            normalizedEmail,
            normalizedPhone,
            password
          );

        console.log(
          '[useSignUpForm] Signup result:',
          result
        );

        // ---------------------------------------------------------
        // PHONE VERIFICATION REQUIRED
        //
        // IMPORTANT:
        //
        // This MUST be checked BEFORE result.success.
        //
        // A newly created customer is not authenticated yet because
        // the phone must be verified first.
        // ---------------------------------------------------------

        if (
          result &&
          result.requiresVerification
        ) {
          const customerId =
            result.customerId ||
            (
              result.data &&
              result.data.customerId
            );

          const verificationPhone =
            result.phone ||
            (
              result.data &&
              result.data.phone
            ) ||
            normalizedPhone;

          if (
            customerId &&
            verificationPhone
          ) {
            /*
             * Replace the signup screen instead of pushing.
             *
             * This prevents the user from going back to the signup
             * form after the account has already been created.
             */
            router.replace(
              `/verify-phone?customerId=${encodeURIComponent(
                customerId
              )}&phone=${encodeURIComponent(
                verificationPhone
              )}`
            );

            return;
          }

          /*
           * The backend said verification is required,
           * but did not provide enough information to open
           * the verification screen.
           */
          setSignupError(
            'Your account was created, but we could not open phone verification. Please try logging in again.'
          );

          return;
        }

        // ---------------------------------------------------------
        // NORMAL SUCCESS
        //
        // This should only happen when the user can already be
        // authenticated without additional verification.
        // ---------------------------------------------------------

        if (
          result &&
          result.success
        ) {
          router.replace(
            '/(tabs)'
          );

          return;
        }

        // ---------------------------------------------------------
        // NORMAL SIGNUP ERROR
        // ---------------------------------------------------------

        setSignupError(
          (
            result &&
            result.message
          ) ||
            'Signup failed. Please try again.'
        );
      } catch (
        err
      ) {
        console.error(
          '[useSignUpForm] Signup error:',
          err
        );

        if (
          mountedRef.current
        ) {
          setSignupError(
            (
              err &&
              err.message
            ) ||
            'Signup failed. Please try again.'
          );
        }
      } finally {
        if (
          mountedRef.current
        ) {
          setLoading(
            false
          );
        }
      }
    };

  // ---------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------

  return {
    fullName,

    email,

    phone,

    password,

    confirmPassword,

    agree,

    setAgree,

    showPassword,

    setShowPassword,

    showConfirm,

    setShowConfirm,

    loading,

    errors,

    signupError,

    handleFieldChange,

    handleSignup,
  };
}