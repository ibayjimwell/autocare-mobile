import { z } from "zod";

/**
 * Customer signup validation.
 *
 * Phone is REQUIRED.
 * Email is OPTIONAL.
 */
export const signupSchema =
  z.object({
    fullName: z
      .string()
      .min(
        1,
        "Full name is required"
      ),

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
            "Please enter a valid email address.",
        }
      ),

    phone: z
      .string()
      .min(
        1,
        "Phone number is required"
      ),

    password: z
      .string()
      .min(
        6,
        "Password must be at least 6 characters."
      ),

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

/**
 * Customer login validation.
 *
 * Customer can log in using:
 *
 * - email
 * - phone
 */
export const loginSchema =
  z.object({
    emailOrPhone: z
      .string()
      .min(
        1,
        "Email or phone number is required"
      ),

    password: z
      .string()
      .min(
        1,
        "Password is required"
      ),
  });