import {
  useState,
} from "react";

import {
  router,
} from "expo-router";

import {
  useAuth,
} from "../context/AuthContext";

import {
  loginSchema,
} from "../utils/validation";

export function useLoginForm() {
  const {
    login,
  } = useAuth();

  // ----------------------------------------------------------------
  // Form state
  // ----------------------------------------------------------------

  const [
    emailOrPhone,
    setEmailOrPhone,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  // ----------------------------------------------------------------
  // UI state
  // ----------------------------------------------------------------

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  // ----------------------------------------------------------------
  // Validation / error state
  // ----------------------------------------------------------------

  const [
    errors,
    setErrors,
  ] = useState({});

  const [
    loginError,
    setLoginError,
  ] = useState("");

  // ----------------------------------------------------------------
  // Deactivated account modal
  // ----------------------------------------------------------------

  const [
    deactivatedModalVisible,
    setDeactivatedModalVisible,
  ] = useState(false);

  // ----------------------------------------------------------------
  // Handle field changes
  // ----------------------------------------------------------------

  const handleFieldChange = (
    field,
    value
  ) => {
    // --------------------------------------------------------------
    // Update field
    // --------------------------------------------------------------

    if (
      field ===
      "emailOrPhone"
    ) {
      setEmailOrPhone(
        value
      );
    } else if (
      field ===
      "password"
    ) {
      setPassword(
        value
      );
    }

    // --------------------------------------------------------------
    // Clear field validation error
    // --------------------------------------------------------------

    if (
      errors &&
      errors[field]
    ) {
      setErrors(
        previous => ({
          ...previous,
          [field]: "",
        })
      );
    }

    // --------------------------------------------------------------
    // Clear general login error
    // --------------------------------------------------------------

    if (
      loginError
    ) {
      setLoginError(
        ""
      );
    }
  };

  // ----------------------------------------------------------------
  // Close deactivated modal
  // ----------------------------------------------------------------

  const closeDeactivatedModal =
    () => {
      setDeactivatedModalVisible(
        false
      );
    };

  // ----------------------------------------------------------------
  // Handle login
  // ----------------------------------------------------------------

  const handleLogin =
    async () => {
      // ------------------------------------------------------------
      // Clear previous error state
      // ------------------------------------------------------------

      setLoginError(
        ""
      );

      setDeactivatedModalVisible(
        false
      );

      // ------------------------------------------------------------
      // Validate form
      // ------------------------------------------------------------

      try {
        loginSchema.parse({
          emailOrPhone,
          password,
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
        }

        setErrors(
          formattedErrors
        );

        return;
      }

      // ------------------------------------------------------------
      // Start request
      // ------------------------------------------------------------

      setLoading(
        true
      );

      try {
        const identifier =
          emailOrPhone.trim();

        console.log(
          "[useLoginForm] Logging in with:",
          identifier
        );

        const result =
          await login(
            identifier,
            password
          );

        console.log(
          "[useLoginForm] Login result:",
          result
        );

        // ----------------------------------------------------------
        // ACCOUNT DEACTIVATED
        //
        // This is deliberately checked before normal errors.
        // ----------------------------------------------------------

        if (
          result &&
          result.deactivated
        ) {
          console.warn(
            "[useLoginForm] Account is deactivated."
          );

          setLoginError(
            ""
          );

          setDeactivatedModalVisible(
            true
          );

          return;
        }

        // ----------------------------------------------------------
        // SUCCESS
        // ----------------------------------------------------------

        if (
          result &&
          result.success
        ) {
          router.replace(
            "/(tabs)"
          );

          return;
        }

        // ----------------------------------------------------------
        // PHONE VERIFICATION REQUIRED
        // ----------------------------------------------------------

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

          const phone =
            result.phone ||
            (
              result.data &&
              result.data.phone
            );

          if (
            customerId &&
            phone
          ) {
            router.replace(
              `/verify-phone?customerId=${encodeURIComponent(
                customerId
              )}&phone=${encodeURIComponent(
                phone
              )}`
            );

            return;
          }

          setLoginError(
            "Phone verification information is missing."
          );

          return;
        }

        // ----------------------------------------------------------
        // NORMAL LOGIN ERROR
        // ----------------------------------------------------------

        setLoginError(
          (
            result &&
            result.message
          ) ||
            "Login failed. Please try again."
        );
      } catch (
        err
      ) {
        console.error(
          "[useLoginForm] Login error:",
          err
        );

        // ----------------------------------------------------------
        // Defensive 403 check
        //
        // This handles the situation where the API layer throws
        // instead of returning the response object.
        // ----------------------------------------------------------

        const errorStatus =
          err?.status ||
          err?.statusCode ||
          err?.response?.status;

        const errorTitle =
          err?.errorTitle ||
          err?.response?.data
            ?.errorTitle;

        const errorMessage =
          err?.errorMessage ||
          err?.response?.data
            ?.errorMessage ||
          err?.message ||
          err?.response?.data
            ?.message;

        if (
          errorStatus ===
            403 ||
          errorTitle ===
            "Account deactivated" ||
          (
            typeof errorMessage ===
              "string" &&
            errorMessage
              .toLowerCase()
              .includes(
                "account is deactivated"
              )
          )
        ) {
          setLoginError(
            ""
          );

          setDeactivatedModalVisible(
            true
          );

          return;
        }

        setLoginError(
          errorMessage ||
            "Login failed. Please try again."
        );
      } finally {
        setLoading(
          false
        );
      }
    };

  // ----------------------------------------------------------------
  // Return
  // ----------------------------------------------------------------

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

    handleFieldChange,

    handleLogin,
  };
}