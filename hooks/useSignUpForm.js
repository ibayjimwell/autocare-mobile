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
  normalizePhilippinePhone,
  isValidPhilippinePhone,
  validateSignupField,
} from '../utils/validation';

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
  // Validation state
  // ---------------------------------------------------------------

  const [
    errors,
    setErrors,
  ] = useState({});

  // ---------------------------------------------------------------
  // General signup/API error
  // ---------------------------------------------------------------

  const [
    signupError,
    setSignupError,
  ] = useState('');

  // ---------------------------------------------------------------
  // Track whether the user has interacted with each field.
  //
  // This prevents the form from showing every required-field error
  // immediately when the screen first opens.
  // ---------------------------------------------------------------

  const touchedRef =
    useRef({});

  // ---------------------------------------------------------------
  // Mounted state
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
  // Get current form values
  // ---------------------------------------------------------------

  const getFormValues =
    (
      overrides = {}
    ) => ({
      fullName:
        overrides.fullName !==
        undefined
          ? overrides.fullName
          : fullName,

      email:
        overrides.email !==
        undefined
          ? overrides.email
          : email,

      phone:
        overrides.phone !==
        undefined
          ? overrides.phone
          : phone,

      password:
        overrides.password !==
        undefined
          ? overrides.password
          : password,

      confirmPassword:
        overrides.confirmPassword !==
        undefined
          ? overrides.confirmPassword
          : confirmPassword,
    });

  // ---------------------------------------------------------------
  // Set one field error
  // ---------------------------------------------------------------

  const setFieldError = (
    field,
    message
  ) => {
    setErrors(
      previous => {
        if (
          previous[field] ===
          message
        ) {
          return previous;
        }

        return {
          ...previous,
          [field]:
            message || '',
        };
      }
    );
  };

  // ---------------------------------------------------------------
  // Validate one field while typing
  // ---------------------------------------------------------------

  const validateField =
    (
      field,
      values
    ) => {
      if (
        !touchedRef.current[
          field
        ]
      ) {
        return;
      }

      const result =
        validateSignupField(
          field,
          values
        );

      setFieldError(
        field,
        result.error
      );

      // -----------------------------------------------------------
      // When password changes, also revalidate confirmation.
      // -----------------------------------------------------------

      if (
        field ===
        'password'
      ) {
        if (
          touchedRef.current
            .confirmPassword
        ) {
          const confirmResult =
            validateSignupField(
              'confirmPassword',
              values
            );

          setFieldError(
            'confirmPassword',
            confirmResult.error
          );
        }
      }
    };

  // ---------------------------------------------------------------
  // Validate all touched fields
  // ---------------------------------------------------------------

  const validateTouchedFields =
    values => {
      Object.keys(
        touchedRef.current
      ).forEach(
        field => {
          if (
            touchedRef.current[
              field
            ]
          ) {
            validateField(
              field,
              values
            );
          }
        }
      );
    };

  // ---------------------------------------------------------------
  // Handle field change
  // ---------------------------------------------------------------

  const handleFieldChange = (
    field,
    value
  ) => {
    // -------------------------------------------------------------
    // Mark field as touched.
    // -------------------------------------------------------------

    touchedRef.current[
      field
    ] = true;

    // -------------------------------------------------------------
    // Update state
    // -------------------------------------------------------------

    let nextValue =
      value;

    // -------------------------------------------------------------
    // Phone
    //
    // Keep what the user typed while typing.
    //
    // We validate against the normalized value, but do not replace
    // the visible value on every keystroke because that would make
    // the input jump while the user is typing.
    // -------------------------------------------------------------

    if (
      field ===
      'fullName'
    ) {
      setFullName(
        nextValue
      );
    } else if (
      field ===
      'email'
    ) {
      setEmail(
        nextValue
      );
    } else if (
      field ===
      'phone'
    ) {
      setPhone(
        nextValue
      );
    } else if (
      field ===
      'password'
    ) {
      setPassword(
        nextValue
      );
    } else if (
      field ===
      'confirmPassword'
    ) {
      setConfirmPassword(
        nextValue
      );
    }

    // -------------------------------------------------------------
    // Clear general API error as soon as the user edits anything.
    // -------------------------------------------------------------

    if (
      signupError
    ) {
      setSignupError(
        ''
      );
    }

    // -------------------------------------------------------------
    // Build the next form snapshot.
    //
    // React state updates are asynchronous, so validation should
    // use the new value directly rather than stale state.
    // -------------------------------------------------------------

    const nextValues =
      getFormValues({
        [field]:
          nextValue,
      });

    // -------------------------------------------------------------
    // Real-time Zod validation
    // -------------------------------------------------------------

    validateField(
      field,
      nextValues
    );

    // -------------------------------------------------------------
    // Confirm password depends on password.
    //
    // Revalidate it immediately if either password field changes.
    // -------------------------------------------------------------

    if (
      field ===
        'password' ||
      field ===
        'confirmPassword'
    ) {
      if (
        touchedRef.current
          .confirmPassword
      ) {
        const confirmResult =
          validateSignupField(
            'confirmPassword',
            nextValues
          );

        setFieldError(
          'confirmPassword',
          confirmResult.error
        );
      }
    }
  };

  // ---------------------------------------------------------------
  // Normalize phone for submission
  // ---------------------------------------------------------------

  const getNormalizedPhone =
    value => {
      return normalizePhilippinePhone(
        value
      );
    };

  // ---------------------------------------------------------------
  // Complete Zod validation
  // ---------------------------------------------------------------

  const runCompleteValidation =
    () => {
      const rawValues =
        getFormValues();

      // -----------------------------------------------------------
      // Mark every form field as touched so all errors become
      // visible when submit is attempted.
      // -----------------------------------------------------------

      touchedRef.current = {
        fullName:
          true,

        email:
          true,

        phone:
          true,

        password:
          true,

        confirmPassword:
          true,
      };

      // -----------------------------------------------------------
      // Normalize phone BEFORE sending it through the complete
      // schema.
      // -----------------------------------------------------------

      const normalizedPhone =
        getNormalizedPhone(
          rawValues.phone
        );

      const values = {
        ...rawValues,

        phone:
          normalizedPhone,
      };

      // -----------------------------------------------------------
      // Run complete Zod validation.
      // -----------------------------------------------------------

      const result =
        signupSchema.safeParse(
          values
        );

      if (
        result.success
      ) {
        setErrors({});

        return {
          valid: true,

          values:
            result.data,
        };
      }

      // -----------------------------------------------------------
      // Convert Zod issues into field errors.
      // -----------------------------------------------------------

      const formattedErrors =
        {};

      result.error.issues.forEach(
        issue => {
          if (
            issue &&
            issue.path &&
            issue.path.length >
              0
          ) {
            const field =
              issue.path[0];

            if (
              !formattedErrors[
                field
              ]
            ) {
              formattedErrors[
                field
              ] =
                issue.message;
            }
          }
        }
      );

      setErrors(
        formattedErrors
      );

      return {
        valid: false,

        values,
      };
    };

  // ---------------------------------------------------------------
  // Signup
  // ---------------------------------------------------------------

  const handleSignup =
    async () => {
      setSignupError('');

      // -----------------------------------------------------------
      // Complete validation
      // -----------------------------------------------------------

      const validation =
        runCompleteValidation();

      if (
        !validation.valid
      ) {
        return;
      }

      // -----------------------------------------------------------
      // Terms
      //
      // This is application/UI validation and is not part of the
      // customer API payload.
      // -----------------------------------------------------------

      if (
        !agree
      ) {
        setSignupError(
          'You must agree to the Terms of Service.'
        );

        return;
      }

      // -----------------------------------------------------------
      // Validated values
      // -----------------------------------------------------------

      const validatedValues =
        validation.values;

      const normalizedPhone =
        validatedValues.phone;

      const normalizedEmail =
        typeof validatedValues.email ===
          'string' &&
        validatedValues.email.trim()
          ? validatedValues.email
              .trim()
              .toLowerCase()
          : '';

      // -----------------------------------------------------------
      // Defensive phone check
      // -----------------------------------------------------------

      if (
        !isValidPhilippinePhone(
          normalizedPhone
        )
      ) {
        setErrors(
          previous => ({
            ...previous,

            phone:
              'Phone number must be a valid Philippine mobile number.',
          })
        );

        return;
      }

      // -----------------------------------------------------------
      // Update phone to canonical format after successful
      // validation.
      // -----------------------------------------------------------

      setPhone(
        normalizedPhone
      );

      // -----------------------------------------------------------
      // Submit
      // -----------------------------------------------------------

      setLoading(
        true
      );

      try {
        const result =
          await register(
            validatedValues.fullName,
            normalizedEmail,
            normalizedPhone,
            validatedValues.password
          );

        console.log(
          '[useSignUpForm] Signup result:',
          result
        );

        // ---------------------------------------------------------
        // PHONE VERIFICATION REQUIRED
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
            router.replace(
              `/verify-phone?customerId=${encodeURIComponent(
                customerId
              )}&phone=${encodeURIComponent(
                verificationPhone
              )}`
            );

            return;
          }

          setSignupError(
            'Your account was created, but we could not open phone verification. Please try logging in again.'
          );

          return;
        }

        // ---------------------------------------------------------
        // NORMAL SUCCESS
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
        // API ERROR
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