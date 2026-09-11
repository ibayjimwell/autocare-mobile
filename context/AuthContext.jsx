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

import {
  useRealtimeTable,
} from "../connections/useRealtimeTable";

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
  // Clear local authentication only
  //
  // Used when a realtime customer update detects that the account
  // has been deactivated.
  // ------------------------------------------------------------------

  const clearAuthentication =
    () => {
      console.log(
        "[Auth] Clearing local authentication."
      );

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

        if (
          result?.error
        ) {
          console.warn(
            "[Presence] Failed:",
            result?.errorMessage ||
              result?.message ||
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
  // REALTIME CUSTOMER DEACTIVATION
  //
  // Subscribe only to the currently logged-in customer.
  //
  // Supabase filter:
  //
  // id=eq.<customer-id>
  //
  // When the admin changes:
  //
  // deactivated: false -> true
  //
  // the mobile app immediately clears the local session.
  // ------------------------------------------------------------------

  useRealtimeTable(
    "customers",
    user?.id
      ? `id=eq.${user.id}`
      : null,
    payload => {
      if (
        !payload
      ) {
        return;
      }

      const eventType =
        payload.eventType;

      const newCustomer =
        payload.new || {};

      const oldCustomer =
        payload.old || {};

      console.log(
        "[Realtime][Customers] Event:",
        eventType,
        {
          id:
            newCustomer.id ||
            oldCustomer.id,
          deactivated:
            newCustomer.deactivated,
        }
      );

      // --------------------------------------------------------------
      // Customer deleted
      // --------------------------------------------------------------

      if (
        eventType ===
        "DELETE"
      ) {
        console.warn(
          "[Auth] Current customer was deleted. Logging out."
        );

        clearAuthentication();

        return;
      }

      // --------------------------------------------------------------
      // Customer inserted
      //
      // Normally this does not concern the current authenticated user,
      // so there is nothing to do here.
      // --------------------------------------------------------------

      if (
        eventType ===
        "INSERT"
      ) {
        if (
          newCustomer.deactivated ===
          true
        ) {
          console.warn(
            "[Auth] Current customer is deactivated."
          );

          clearAuthentication();
        }

        return;
      }

      // --------------------------------------------------------------
      // Customer updated
      // --------------------------------------------------------------

      if (
        eventType ===
        "UPDATE"
      ) {
        // ------------------------------------------------------------
        // Explicitly detect false -> true.
        //
        // This prevents unrelated customer updates from causing a
        // logout.
        // ------------------------------------------------------------

        const wasDeactivated =
          oldCustomer.deactivated ===
          true;

        const isDeactivated =
          newCustomer.deactivated ===
          true;

        if (
          isDeactivated &&
          !wasDeactivated
        ) {
          console.warn(
            "[Auth] Current customer was deactivated in realtime."
          );

          clearAuthentication();

          return;
        }

        // ------------------------------------------------------------
        // Defensive check:
        //
        // If the initial realtime payload does not contain the old
        // value, but the new value says deactivated=true, still log
        // out.
        // ------------------------------------------------------------

        if (
          isDeactivated
        ) {
          console.warn(
            "[Auth] Realtime customer record is deactivated."
          );

          clearAuthentication();
        }
      }
    }
  );

  // ------------------------------------------------------------------
  // RESTORE EXISTING SESSION
  // ------------------------------------------------------------------

  useEffect(() => {
    let mounted = true;

    const loadSession =
      async () => {
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

            if (
              mounted
            ) {
              setToken(
                null
              );

              setUser(
                null
              );
            }
          };

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
          // Detect locally stored deactivated user immediately
          // ----------------------------------------------------------

          if (
            parsedUser.deactivated ===
            true
          ) {
            console.warn(
              "[Auth] Stored customer is deactivated."
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
            const meResponse =
              await authApi.getMe();

            console.log(
              "[Auth] Server verification OK."
            );

            // --------------------------------------------------------
            // Check fresh backend customer state.
            //
            // This catches deactivation even if realtime was not
            // available while the app was closed/backgrounded.
            // --------------------------------------------------------

            const serverCustomer =
              meResponse?.data;

            if (
              serverCustomer
                ?.deactivated ===
              true
            ) {
              console.warn(
                "[Auth] Server reports customer is deactivated."
              );

              clearStorage();

              return;
            }

            // --------------------------------------------------------
            // Update stored user with fresh customer data.
            // --------------------------------------------------------

            if (
              serverCustomer &&
              mounted
            ) {
              storage.setItem(
                "auth_user",
                JSON.stringify(
                  serverCustomer
                )
              );

              parsedUser =
                serverCustomer;
            }
          } catch (
            serverError
          ) {
            console.warn(
              "[Auth] Server verification failed:",
              serverError?.message ||
                serverError
            );

            clearStorage();

            return;
          }

          if (
            !mounted
          ) {
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
          if (
            mounted
          ) {
            setLoading(
              false
            );
          }
        }
      };

    loadSession();

    return () => {
      mounted =
        false;
    };
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
        if (
          !user?.id
        ) {
          return;
        }

        await updateCustomerPresence(
          user.id,
          true
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
          setInterval(
            () => {
              if (
                appState.current ===
                "active"
              ) {
                void sendOnline();
              }
            },
            PRESENCE_INTERVAL
          );
      };

    // ---------------------------------------------------------------
    // Initial presence
    // ---------------------------------------------------------------

    if (
      user?.id &&
      appState.current ===
        "active"
    ) {
      void sendOnline();

      startHeartbeat();
    }

    // ---------------------------------------------------------------
    // AppState listener
    // ---------------------------------------------------------------

    const subscription =
      AppState.addEventListener(
        "change",
        nextAppState => {
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
  // Returns:
  //
  // {
  //   success: false,
  //   deactivated: true,
  //   message: ...
  // }
  //
  // when backend returns 403 because the customer is deactivated.
  // ------------------------------------------------------------------

  const login =
    async (
      emailOrPhone,
      password
    ) => {
      try {
        const identifier =
          typeof emailOrPhone ===
          "string"
            ? emailOrPhone.trim()
            : "";

        console.log(
          "[Auth] Login identifier:",
          identifier
        );

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
        // Customer account is deactivated
        //
        // Backend currently returns 403 with:
        //
        // errorTitle: "Account deactivated"
        //
        // errorMessage:
        // "Your account is deactivated..."
        // ------------------------------------------------------------

        if (
          res?.status ===
            403 ||
          res?.statusCode ===
            403 ||
          res?.errorType ===
            "deactivated" ||
          res?.errorTitle ===
            "Account deactivated" ||
          res?.message ===
            "Your account is deactivated. Please contact the admin for assistance." ||
          res?.errorMessage ===
            "Your account is deactivated. Please contact the admin for assistance."
        ) {
          return {
            success: false,

            deactivated:
              true,

            message:
              res.errorMessage ||
              res.message ||
              "Your account has been deactivated. Please contact the administrator.",
          };
        }

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
          res?.data
            ?.customer;

        const newToken =
          res?.data
            ?.token;

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
        // Defensive deactivation check
        // ------------------------------------------------------------

        if (
          customer.deactivated ===
          true
        ) {
          return {
            success: false,

            deactivated:
              true,

            message:
              "Your account has been deactivated. Please contact the administrator.",
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

          deactivated:
            err?.status === 403,

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
        // Create customer
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
        // Customer ID
        // ------------------------------------------------------------

        const customerId =
          res?.data?.id;

        // ------------------------------------------------------------
        // Login identifier
        //
        // Email first when provided.
        // Phone otherwise.
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
        // Deactivated should not normally happen for newly created
        // customers, but handle it defensively.
        // ------------------------------------------------------------

        if (
          loginRes?.status ===
            403 ||
          loginRes?.statusCode ===
            403 ||
          loginRes?.errorTitle ===
            "Account deactivated" ||
          loginRes?.errorMessage ===
            "Your account is deactivated. Please contact the admin for assistance."
        ) {
          return {
            success: false,

            deactivated:
              true,

            message:
              loginRes.errorMessage ||
              loginRes.message ||
              "Your account has been deactivated.",
          };
        }

        // ------------------------------------------------------------
        // Auto-login error
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
          loginRes?.data
            ?.token;

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
        // Defensive deactivation check
        // ------------------------------------------------------------

        if (
          customer.deactivated ===
          true
        ) {
          return {
            success: false,

            deactivated:
              true,

            message:
              "Your account has been deactivated.",
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
          res?.data;

        // ------------------------------------------------------------
        // Deactivated user
        // ------------------------------------------------------------

        if (
          customer?.deactivated ===
          true
        ) {
          console.warn(
            "[Auth] refreshUser detected deactivated customer."
          );

          clearAuthentication();

          return null;
        }

        // ------------------------------------------------------------
        // Store fresh user
        // ------------------------------------------------------------

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
    // ---------------------------------------------------------------
    // Never create a session for a deactivated customer
    // ---------------------------------------------------------------

    if (
      customer?.deactivated ===
      true
    ) {
      console.warn(
        "[Auth] Refusing to create session for deactivated customer."
      );

      clearAuthentication();

      return;
    }

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

      clearAuthentication();
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