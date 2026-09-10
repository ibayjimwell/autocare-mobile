import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
} from "react";

import {
  AppState,
} from "react-native";

import {
  storage,
} from "../utils/storage";

import authApi from "../services/authApi";

import customersApi from "../services/customersApi";

import {
  decodeToken,
} from "../utils/jwt";

const AuthContext =
  createContext();

const PRESENCE_INTERVAL =
  30000;

export const AuthProvider = ({
  children,
}) => {
  const [
    user,
    setUser,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    token,
    setToken,
  ] = useState(null);

  const appState =
    useRef(
      AppState.currentState
    );

  const presenceIntervalRef =
    useRef(null);

  const presenceUserIdRef =
    useRef(null);

  // ------------------------------------------------------------------
  // CUSTOMER PRESENCE
  // ------------------------------------------------------------------

  const updateCustomerPresence =
    async (
      customerId,
      isOnline
    ) => {
      if (!customerId) {
        return;
      }

      try {
        const result =
          await customersApi.updatePresence(
            customerId,
            isOnline
          );

        if (result?.error) {
          console.warn(
            "[Presence] Failed:",
            result?.errorMessage ||
              "Unable to update customer presence."
          );
        } else {
          console.log(
            `[Presence] Customer ${
              isOnline
                ? "ONLINE"
                : "OFFLINE"
            }`
          );
        }
      } catch (
        error
      ) {
        console.warn(
          "[Presence] Request failed:",
          error?.message ||
            error
        );
      }
    };

  // ------------------------------------------------------------------
  // RESTORE EXISTING SESSION
  // ------------------------------------------------------------------

  useEffect(() => {
    const clearStorage =
      () => {
        console.log(
          "[Auth] Clearing stored credentials."
        );

        storage.removeItem(
          "auth_token"
        );

        storage.removeItem(
          "auth_user"
        );
      };

    const loadSession =
      async () => {
        try {
          const storedToken =
            storage.getItem(
              "auth_token"
            );

          const storedUser =
            storage.getItem(
              "auth_user"
            );

          console.log(
            "[Auth] Restored token:",
            storedToken
              ? storedToken.substring(
                  0,
                  30
                ) + "..."
              : "NULL"
          );

          console.log(
            "[Auth] Restored user:",
            storedUser
              ? storedUser.substring(
                  0,
                  50
                )
              : "NULL"
          );

          // ----------------------------------------------------------
          // No stored session
          // ----------------------------------------------------------

          if (
            !storedToken ||
            !storedUser
          ) {
            console.log(
              "[Auth] No stored session."
            );

            return;
          }

          // ----------------------------------------------------------
          // Decode token
          // ----------------------------------------------------------

          const decoded =
            decodeToken(
              storedToken
            );

          if (
            !decoded ||
            !decoded.exp
          ) {
            console.warn(
              "[Auth] Token invalid, clearing storage."
            );

            clearStorage();

            return;
          }

          // ----------------------------------------------------------
          // Check token expiration
          // ----------------------------------------------------------

          if (
            decoded.exp <=
            Math.floor(
              Date.now() /
                1000
            )
          ) {
            console.warn(
              "[Auth] Token expired, clearing storage."
            );

            clearStorage();

            return;
          }

          // ----------------------------------------------------------
          // Parse stored user
          // ----------------------------------------------------------

          let parsedUser;

          try {
            parsedUser =
              JSON.parse(
                storedUser
              );
          } catch {
            console.warn(
              "[Auth] User JSON corrupt, clearing storage."
            );

            clearStorage();

            return;
          }

          if (
            !parsedUser ||
            !parsedUser.id
          ) {
            console.warn(
              "[Auth] User object missing id, clearing storage."
            );

            clearStorage();

            return;
          }

          // ----------------------------------------------------------
          // Verify token with backend
          // ----------------------------------------------------------

          console.log(
            "[Auth] Verifying token with server..."
          );

          try {
            await authApi.getMe();

            console.log(
              "[Auth] Server verification OK."
            );
          } catch (
            serverError
          ) {
            console.warn(
              "[Auth] Server verification failed:",
              serverError.message
            );

            clearStorage();

            return;
          }

          // ----------------------------------------------------------
          // Restore session
          // ----------------------------------------------------------

          console.log(
            "[Auth] Session restored successfully."
          );

          setToken(
            storedToken
          );

          setUser(
            parsedUser
          );
        } catch (
          err
        ) {
          console.error(
            "[Auth] Unexpected load error:",
            err
          );

          clearStorage();
        } finally {
          setLoading(
            false
          );
        }
      };

    loadSession();
  }, []);

  // ------------------------------------------------------------------
  // CUSTOMER MOBILE PRESENCE
  //
  // Active app:
  //   Online
  //
  // Background / inactive:
  //   Offline
  //
  // Active heartbeat:
  //   Every 30 seconds
  // ------------------------------------------------------------------

  useEffect(() => {
    presenceUserIdRef.current =
      user?.id || null;

    const sendOnline =
      async () => {
        if (!user?.id) {
          return;
        }

        await updateCustomerPresence(
          user.id,
          true
        );
      };

    const sendOffline =
      async () => {
        if (!user?.id) {
          return;
        }

        await updateCustomerPresence(
          user.id,
          false
        );
      };

    const startHeartbeat =
      () => {
        if (
          presenceIntervalRef.current
        ) {
          clearInterval(
            presenceIntervalRef.current
          );
        }

        presenceIntervalRef.current =
          setInterval(() => {
            if (
              appState.current ===
              "active"
            ) {
              void sendOnline();
            }
          }, PRESENCE_INTERVAL);
      };

    // ---------------------------------------------------------------
    // Initial presence
    // ---------------------------------------------------------------

    if (user?.id) {
      if (
        appState.current ===
        "active"
      ) {
        void sendOnline();

        startHeartbeat();
      }
    }

    // ---------------------------------------------------------------
    // AppState listener
    // ---------------------------------------------------------------

    const subscription =
      AppState.addEventListener(
        "change",
        (
          nextAppState
        ) => {
          const previousState =
            appState.current;

          appState.current =
            nextAppState;

          console.log(
            `[Presence] App state: ${previousState} → ${nextAppState}`
          );

          // ---------------------------------------------------------
          // App became active
          // ---------------------------------------------------------

          if (
            nextAppState ===
            "active"
          ) {
            if (
              user?.id
            ) {
              void sendOnline();

              startHeartbeat();
            }

            return;
          }

          // ---------------------------------------------------------
          // App went background / inactive
          // ---------------------------------------------------------

          if (
            nextAppState ===
              "background" ||
            nextAppState ===
              "inactive"
          ) {
            if (
              presenceUserIdRef.current
            ) {
              void updateCustomerPresence(
                presenceUserIdRef.current,
                false
              );
            }

            if (
              presenceIntervalRef.current
            ) {
              clearInterval(
                presenceIntervalRef.current
              );

              presenceIntervalRef.current =
                null;
            }
          }
        }
      );

    // ---------------------------------------------------------------
    // Cleanup
    // ---------------------------------------------------------------

    return () => {
      subscription.remove();

      if (
        presenceIntervalRef.current
      ) {
        clearInterval(
          presenceIntervalRef.current
        );

        presenceIntervalRef.current =
          null;
      }
    };
  }, [
    user?.id,
  ]);

  // ------------------------------------------------------------------
  // LOGIN
  //
  // Customer can login with:
  //   email
  //   OR
  //   phone number
  //
  // Backend expects:
  // {
  //   emailOrPhone,
  //   password
  // }
  // ------------------------------------------------------------------

  const login =
    async (
      emailOrPhone,
      password
    ) => {
      try {
        // ------------------------------------------------------------
        // Normalize the identifier before sending
        // ------------------------------------------------------------

        const identifier =
          typeof emailOrPhone ===
          "string"
            ? emailOrPhone.trim()
            : "";

        console.log(
          "[Auth] Login identifier:",
          identifier
        );

        // ------------------------------------------------------------
        // IMPORTANT:
        //
        // Backend expects `emailOrPhone`,
        // NOT `email`.
        // ------------------------------------------------------------

        const res =
          await authApi.login({
            emailOrPhone:
              identifier,
            password,
          });

        console.log(
          "[Auth] Login response:",
          res
        );

        // ------------------------------------------------------------
        // API error
        // ------------------------------------------------------------

        if (
          res?.error
        ) {
          return {
            success: false,
            message:
              res.message ||
              res.errorMessage ||
              "Login failed",
          };
        }

        // ------------------------------------------------------------
        // Phone verification required
        // ------------------------------------------------------------

        if (
          res?.data
            ?.requiresVerification
        ) {
          return {
            success: false,

            requiresVerification:
              true,

            customerId:
              res.data
                .customerId,

            phone:
              res.data.phone,

            message:
              "Phone verification required.",
          };
        }

        // ------------------------------------------------------------
        // Successful login
        // ------------------------------------------------------------

        const customer =
          res?.data?.customer;

        const newToken =
          res?.data?.token;

        if (
          !customer ||
          !newToken
        ) {
          console.error(
            "[Auth] Login response missing customer or token:",
            res
          );

          return {
            success: false,
            message:
              "Login response is invalid.",
          };
        }

        // ------------------------------------------------------------
        // Store session
        // ------------------------------------------------------------

        storage.setItem(
          "auth_token",
          newToken
        );

        storage.setItem(
          "auth_user",
          JSON.stringify(
            customer
          )
        );

        setToken(
          newToken
        );

        setUser(
          customer
        );

        return {
          success: true,
          user: customer,
        };
      } catch (
        err
      ) {
        console.error(
          "[Auth] Login error:",
          err
        );

        return {
          success: false,
          message:
            err?.message ||
            "Login failed. Please try again.",
        };
      }
    };

  // ------------------------------------------------------------------
  // REGISTER
  //
  // Email is OPTIONAL.
  //
  // After registration, automatically attempt login using:
  //
  //   email    when supplied
  //   phone    when email is empty
  //
  // Phone verification may be required before a session is created.
  // ------------------------------------------------------------------

  const register =
    async (
      fullName,
      email,
      phone,
      password
    ) => {
      try {
        // ------------------------------------------------------------
        // Normalize values
        // ------------------------------------------------------------

        const normalizedName =
          typeof fullName ===
          "string"
            ? fullName.trim()
            : "";

        const normalizedEmail =
          typeof email ===
            "string" &&
          email.trim() !== ""
            ? email
                .trim()
                .toLowerCase()
            : "";

        const normalizedPhone =
          typeof phone ===
          "string"
            ? phone.trim()
            : "";

        // ------------------------------------------------------------
        // Create customer account
        // ------------------------------------------------------------

        const res =
          await authApi.register({
            fullname:
              normalizedName,

            email:
              normalizedEmail,

            phone:
              normalizedPhone,

            password,
          });

        if (
          res?.error
        ) {
          return {
            success: false,
            message:
              res.message ||
              res.errorMessage ||
              "Registration failed",
          };
        }

        // ------------------------------------------------------------
        // Customer ID returned from registration
        // ------------------------------------------------------------

        const customerId =
          res.data?.id;

        // ------------------------------------------------------------
        // IMPORTANT:
        //
        // Because email is optional, do not attempt to login using
        // an empty email.
        //
        // Use email when supplied, otherwise phone.
        // ------------------------------------------------------------

        const loginIdentifier =
          normalizedEmail ||
          normalizedPhone;

        console.log(
          "[Auth] Registration successful."
        );

        console.log(
          "[Auth] Auto-login identifier:",
          loginIdentifier
        );

        // ------------------------------------------------------------
        // Auto-login
        // ------------------------------------------------------------

        const loginRes =
          await authApi.login({
            emailOrPhone:
              loginIdentifier,

            password,
          });

        // ------------------------------------------------------------
        // Auto-login API error
        // ------------------------------------------------------------

        if (
          loginRes?.error
        ) {
          return {
            success: false,
            message:
              "Account created but login failed.",
          };
        }

        // ------------------------------------------------------------
        // Phone verification required
        // ------------------------------------------------------------

        if (
          loginRes?.data
            ?.requiresVerification
        ) {
          return {
            success: false,

            requiresVerification:
              true,

            customerId:
              loginRes.data
                .customerId ||
              customerId,

            phone:
              loginRes.data.phone ||
              normalizedPhone,

            message:
              "Phone verification required.",
          };
        }

        // ------------------------------------------------------------
        // Successful login after registration
        // ------------------------------------------------------------

        const customer =
          loginRes?.data
            ?.customer;

        const newToken =
          loginRes?.data?.token;

        if (
          !customer ||
          !newToken
        ) {
          return {
            success: false,
            message:
              "Account created but login response is invalid.",
          };
        }

        // ------------------------------------------------------------
        // Store authenticated session
        // ------------------------------------------------------------

        storage.setItem(
          "auth_token",
          newToken
        );

        storage.setItem(
          "auth_user",
          JSON.stringify(
            customer
          )
        );

        setToken(
          newToken
        );

        setUser(
          customer
        );

        return {
          success: true,
          user: customer,

          customerId:
            customerId ||
            customer?.id,
        };
      } catch (
        err
      ) {
        console.error(
          "[Auth] Registration error:",
          err
        );

        return {
          success: false,
          message:
            err?.message ||
            "Registration failed. Please try again.",
        };
      }
    };

  // ------------------------------------------------------------------
  // REFRESH CURRENT USER
  // ------------------------------------------------------------------

  const refreshUser =
    async () => {
      try {
        const res =
          await authApi.getMe();

        if (
          res?.error
        ) {
          console.error(
            "Failed to refresh user:",
            res.errorMessage ||
              res.message
          );

          return null;
        }

        const customer =
          res.data;

        storage.setItem(
          "auth_user",
          JSON.stringify(
            customer
          )
        );

        setUser(
          customer
        );

        return customer;
      } catch (
        err
      ) {
        console.error(
          "Failed to refresh user:",
          err
        );

        return null;
      }
    };

  // ------------------------------------------------------------------
  // MANUALLY SET SESSION
  // ------------------------------------------------------------------

  const setSession = (
    customer,
    newToken
  ) => {
    storage.setItem(
      "auth_token",
      newToken
    );

    storage.setItem(
      "auth_user",
      JSON.stringify(
        customer
      )
    );

    setToken(
      newToken
    );

    setUser(
      customer
    );
  };

  // ------------------------------------------------------------------
  // LOGOUT
  // ------------------------------------------------------------------

  const logout =
    async () => {
      try {
        if (
          user?.id
        ) {
          await updateCustomerPresence(
            user.id,
            false
          );
        }
      } catch (
        error
      ) {
        console.warn(
          "[Presence] Logout presence update failed:",
          error
        );
      }

      // --------------------------------------------------------------
      // Clear local authentication
      // --------------------------------------------------------------

      storage.removeItem(
        "auth_token"
      );

      storage.removeItem(
        "auth_user"
      );

      setToken(
        null
      );

      setUser(
        null
      );
    };

  // ------------------------------------------------------------------
  // PROVIDER
  // ------------------------------------------------------------------

  return (
    <AuthContext.Provider
      value={{
        user,

        loading,

        login,

        register,

        logout,

        token,

        setSession,

        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// --------------------------------------------------------------------
// AUTH HOOK
// --------------------------------------------------------------------

export const useAuth =
  () =>
    useContext(
      AuthContext
    );