import {
  storage,
} from '../utils/storage';

/* ================================================================
   API BASE URL
================================================================ */

function getApiBaseUrl() {
  const rawBaseUrl =
    process.env.EXPO_PUBLIC_API_URL ||
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    process.env.EXPO_PUBLIC_API_BASE ||
    '';

  return String(
    rawBaseUrl
  ).replace(
    /\/+$/,
    ''
  );
}

/* ================================================================
   FINDINGS ENDPOINT
================================================================ */

function getFindingsEndpoint(
  appointmentId
) {
  const baseUrl =
    getApiBaseUrl();

  if (
    baseUrl.endsWith(
      '/api'
    )
  ) {
    return `${baseUrl}/service-tracking/findings?appointmentId=${encodeURIComponent(
      appointmentId
    )}`;
  }

  return `${baseUrl}/api/service-tracking/findings?appointmentId=${encodeURIComponent(
    appointmentId
  )}`;
}

/* ================================================================
   PARSE RESPONSE
================================================================ */

async function parseResponse(
  response
) {
  const text =
    await response.text();

  if (
    !text
  ) {
    return {};
  }

  try {
    return JSON.parse(
      text
    );
  } catch {
    return {
      error: true,
      errorMessage:
        'The server returned an invalid response.',
    };
  }
}

/* ================================================================
   FINDINGS API
================================================================ */

const findingsApi = {
  /* ==============================================================
     LIST BY APPOINTMENT
  ============================================================== */

  async list(
    appointmentId
  ) {
    if (
      !appointmentId
    ) {
      return {
        error:
          true,
        errorMessage:
          'Missing appointment ID.',
        data:
          [],
      };
    }

    const baseUrl =
      getApiBaseUrl();

    if (
      !baseUrl
    ) {
      return {
        error:
          true,
        errorMessage:
          'API base URL is not configured.',
        data:
          [],
      };
    }

    try {
      const token =
        await storage.getItem(
          'auth_token'
        );

      const response =
        await fetch(
          getFindingsEndpoint(
            appointmentId
          ),
          {
            method:
              'GET',

            headers: {
              Accept:
                'application/json',

              ...(token
                ? {
                    Authorization:
                      `Bearer ${token}`,
                  }
                : {}),
            },
          }
        );

      const result =
        await parseResponse(
          response
        );

      if (
        !response.ok
      ) {
        return {
          error:
            true,

          errorMessage:
            result?.errorMessage ||
            result?.message ||
            `Failed to load findings (${response.status}).`,

          errorType:
            result?.errorType ||
            `http_${response.status}`,

          data:
            [],
        };
      }

      const data =
        Array.isArray(
          result?.data
        )
          ? result.data
          : Array.isArray(
              result
            )
            ? result
            : [];

      return {
        error:
          false,

        data:
          data.map(
            (
              finding
            ) => ({
              ...finding,

              parts:
                Array.isArray(
                  finding?.parts
                )
                  ? finding.parts
                  : Array.isArray(
                      finding?.products
                    )
                    ? finding.products
                    : [],
            })
          ),
      };
    } catch (
      error
    ) {
      console.error(
        '[findingsApi] Failed to load findings:',
        error
      );

      return {
        error:
          true,

        errorMessage:
          error?.message ||
          'Failed to load findings.',

        data:
          [],
      };
    }
  },

  /* ==============================================================
     ALIAS
     
     Kept so the mobile service follows the same terminology as
     other appointment-scoped APIs.
  ============================================================== */

  async getByAppointment(
    appointmentId
  ) {
    return this.list(
      appointmentId
    );
  },
};

export default findingsApi;