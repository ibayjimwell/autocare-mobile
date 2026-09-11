import { z } from "zod";

/**
 * ---------------------------------------------------------------
 * Philippine phone normalization
 * ---------------------------------------------------------------
 *
 * Accepted examples:
 *
 * 09157803417
 * 9157803417
 * 639157803417
 * +639157803417
 * +63 915 780 3417
 * 09 157 803 417
 *
 * Canonical result:
 *
 * +639XXXXXXXXX
 */
export function normalizePhilippinePhone(
  value
) {
  if (
    typeof value !==
    "string"
  ) {
    return "";
  }

  let digits =
    value.replace(
      /\D/g,
      ""
    );

  if (!digits) {
    return "";
  }

  // -------------------------------------------------------------
  // Remove local leading zero
  //
  // 09157803417
  //       ↓
  // 9157803417
  // -------------------------------------------------------------

  if (
    digits.startsWith("0")
  ) {
    digits =
      digits.replace(
        /^0+/,
        ""
      );
  }

  // -------------------------------------------------------------
  // Remove country code if already supplied
  //
  // 639157803417
  //       ↓
  // 9157803417
  // -------------------------------------------------------------

  if (
    digits.startsWith("63")
  ) {
    digits =
      digits.slice(2);
  }

  // -------------------------------------------------------------
  // Philippine mobile numbers begin with 9
  // -------------------------------------------------------------

  if (
    digits.startsWith("9")
  ) {
    return `+63${digits}`;
  }

  return "";
}

/**
 * ---------------------------------------------------------------
 * Philippine phone validation
 * ---------------------------------------------------------------
 *
 * Canonical format:
 *
 * +639XXXXXXXXX
 */
export function isValidPhilippinePhone(
  value
) {
  return /^\+639\d{9}$/.test(
    value
  );
}

/**
 * ---------------------------------------------------------------
 * Customer Signup Schema
 * ---------------------------------------------------------------
 *
 * These are the client-side signup rules and should stay aligned
 * with the backend customer creation validation:
 *
 * fullName:
 *   required
 *
 * email:
 *   optional
 *   valid email when supplied
 *
 * phone:
 *   required
 *   valid Philippine mobile number
 *
 * password:
 *   required
 *   minimum 6 characters
 *
 * confirmPassword:
 *   UI-level confirmation
 *
 * The backend itself does not receive confirmPassword.
 */
export const signupSchema =
  z
    .object({
      // -----------------------------------------------------------
      // FULL NAME
      // -----------------------------------------------------------

      fullName: z
        .string()
        .trim()
        .min(
          1,
          "Full name is required."
        ),

      // -----------------------------------------------------------
      // EMAIL
      //
      // Optional.
      //
      // Empty string is allowed because the database/API allow NULL.
      // -----------------------------------------------------------

      email: z
        .string()
        .trim()
        .refine(
          value =>
            value === "" ||
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
              value
            ),
          {
            message:
              "Email must be a valid email address.",
          }
        ),

      // -----------------------------------------------------------
      // PHONE
      //
      // We validate the value after normalization.
      // -----------------------------------------------------------

      phone: z
        .string()
        .min(
          1,
          "Phone number is required."
        )
        .transform(
          value =>
            normalizePhilippinePhone(
              value
            )
        )
        .refine(
          value =>
            isValidPhilippinePhone(
              value
            ),
          {
            message:
              "Phone number must be a valid Philippine mobile number.",
          }
        ),

      // -----------------------------------------------------------
      // PASSWORD
      // -----------------------------------------------------------

      password: z
        .string()
        .min(
          1,
          "Password is required."
        )
        .min(
          6,
          "Password must be at least 6 characters."
        ),

      // -----------------------------------------------------------
      // CONFIRM PASSWORD
      // -----------------------------------------------------------

      confirmPassword:
        z.string(),
    })
    .refine(
      data => {
        /*
         * Do not show "Passwords do not match" while the confirmation
         * field is still completely empty.
         *
         * Once the user starts entering a confirmation value,
         * compare it with the password.
         */
        if (
          data.confirmPassword ===
          ""
        ) {
          return true;
        }

        return (
          data.password ===
          data.confirmPassword
        );
      },
      {
        message:
          "Passwords do not match.",
        path: [
          "confirmPassword",
        ],
      }
    );

/**
 * ---------------------------------------------------------------
 * Complete validation helper
 * ---------------------------------------------------------------
 */
export function validateSignup(
  values
) {
  return signupSchema.safeParse(
    values
  );
}

/**
 * ---------------------------------------------------------------
 * Validate one signup field in real time
 * ---------------------------------------------------------------
 *
 * This helper is used by useSignUpForm while the user is typing.
 *
 * It returns:
 *
 * {
 *   valid: true,
 *   error: ""
 * }
 *
 * or:
 *
 * {
 *   valid: false,
 *   error: "..."
 * }
 * ---------------------------------------------------------------
 */
export function validateSignupField(
  field,
  values
) {
  // -------------------------------------------------------------
  // PHONE
  //
  // Phone gets normalized before the Zod field receives it.
  // -------------------------------------------------------------

  if (
    field ===
    "phone"
  ) {
    const rawPhone =
      typeof values.phone ===
      "string"
        ? values.phone
        : "";

    // Empty phone:
    // Let Zod return the required-field message.
    if (
      rawPhone.trim() ===
      ""
    ) {
      const result =
        z
          .string()
          .min(
            1,
            "Phone number is required."
          )
          .safeParse(
            rawPhone
          );

      return {
        valid:
          result.success,
        error:
          result.success
            ? ""
            : result.error
                .issues[0]
                ?.message ||
              "",
      };
    }

    const normalizedPhone =
      normalizePhilippinePhone(
        rawPhone
      );

    // -----------------------------------------------------------
    // Validate normalized phone using the exact Zod rule.
    // -----------------------------------------------------------

    const phoneSchema =
      z
        .string()
        .min(
          1,
          "Phone number is required."
        )
        .refine(
          value =>
            isValidPhilippinePhone(
              value
            ),
          {
            message:
              "Phone number must be a valid Philippine mobile number.",
          }
        );

    const result =
      phoneSchema.safeParse(
        normalizedPhone
      );

    return {
      valid:
        result.success,
      error:
        result.success
          ? ""
          : result.error
              .issues[0]
              ?.message ||
            "",
      normalizedValue:
        normalizedPhone,
    };
  }

  // -------------------------------------------------------------
  // CONFIRM PASSWORD
  //
  // This is validated using the full schema so that the
  // password/confirmation relationship stays centralized.
  // -------------------------------------------------------------

  if (
    field ===
    "confirmPassword"
  ) {
    const confirmPassword =
      typeof values.confirmPassword ===
      "string"
        ? values.confirmPassword
        : "";

    // Do not show a mismatch while completely empty.
    if (
      confirmPassword ===
      ""
    ) {
      return {
        valid: true,
        error: "",
      };
    }

    const confirmSchema =
      z
        .object({
          password:
            z.string(),

          confirmPassword:
            z.string(),
        })
        .refine(
          data =>
            data.password ===
            data.confirmPassword,
          {
            message:
              "Passwords do not match.",
            path: [
              "confirmPassword",
            ],
          }
        );

    const result =
      confirmSchema.safeParse({
        password:
          values.password ||
          "",

        confirmPassword,
      });

    return {
      valid:
        result.success,
      error:
        result.success
          ? ""
          : result.error
              .issues[0]
              ?.message ||
            "",
    };
  }

  // -------------------------------------------------------------
  // NORMAL FIELDS
  // -------------------------------------------------------------

  const fieldSchema =
    signupSchema.shape[
      field
    ];

  if (!fieldSchema) {
    return {
      valid: true,
      error: "",
    };
  }

  const rawValue =
    values[field];

  const result =
    fieldSchema.safeParse(
      typeof rawValue ===
        "string"
        ? rawValue
        : ""
    );

  return {
    valid:
      result.success,
    error:
      result.success
        ? ""
        : result.error
            .issues[0]
            ?.message ||
          "",
  };
}

/**
 * ---------------------------------------------------------------
 * Login Schema
 * ---------------------------------------------------------------
 */
export const loginSchema =
  z.object({
    emailOrPhone:
      z
        .string()
        .trim()
        .min(
          1,
          "Email or phone number is required."
        ),

    password:
      z
        .string()
        .min(
          1,
          "Password is required."
        ),
  });