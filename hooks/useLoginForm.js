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

  const [
    emailOrPhone,
    setEmailOrPhone,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

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
  ] = useState("");

  const handleFieldChange = (
    field,
    value
  ) => {
    if (
      field ===
      "emailOrPhone"
    ) {
      setEmailOrPhone(
        value
      );
    } else if (
      field === "password"
    ) {
      setPassword(value);
    }

    if (
      errors &&
      errors[field]
    ) {
      setErrors(
        prev => ({
          ...prev,
          [field]: "",
        })
      );
    }

    if (loginError) {
      setLoginError("");
    }
  };

  const handleLogin =
    async () => {
      setLoginError("");

      // -----------------------------------------------------------
      // Validate
      // -----------------------------------------------------------

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

      setLoading(true);

      try {
        /*
         * AuthContext.login()
         * should submit:
         *
         * {
         *   emailOrPhone,
         *   password
         * }
         */
        const result =
          await login(
            emailOrPhone.trim(),
            password
          );

        if (
          result &&
          result.success
        ) {
          router.replace(
            "/(tabs)"
          );

          return;
        }

        // ---------------------------------------------------------
        // Phone verification required
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
            router.push(
              `/verify-phone?customerId=${customerId}&phone=${encodeURIComponent(
                phone
              )}`
            );

            return;
          }
        }

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

        setLoginError(
          (
            err &&
            err.message
          ) ||
          "Login failed. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

  return {
    emailOrPhone,
    password,

    showPassword,
    setShowPassword,

    loading,

    errors,
    loginError,

    handleFieldChange,
    handleLogin,
  };
}