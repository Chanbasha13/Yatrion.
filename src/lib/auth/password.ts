/**
 * Password Hashing & Input Validation Utilities
 * Uses bcryptjs for established cryptographic security
 */

import bcrypt from "bcryptjs";
import type { SignupInput, LoginInput } from "./auth-types";

const SALT_ROUNDS = 10;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Hashes a plaintext password using bcrypt with 10 salt rounds.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verifies a plaintext password against a stored bcrypt hash.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Validates user signup credentials.
 */
export function validateSignupInput(input: Partial<SignupInput>): {
  valid: boolean;
  errors: { name?: string[]; email?: string[]; password?: string[] };
} {
  const errors: { name?: string[]; email?: string[]; password?: string[] } = {};

  // Name validation
  const name = (input.name || "").trim();
  if (!name) {
    errors.name = ["Name is required."];
  } else if (name.length < 2) {
    errors.name = ["Name must be at least 2 characters long."];
  } else if (name.length > 80) {
    errors.name = ["Name cannot exceed 80 characters."];
  }

  // Email validation
  const email = (input.email || "").trim().toLowerCase();
  if (!email) {
    errors.email = ["Email is required."];
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = ["Please enter a valid email address."];
  }

  // Password validation
  const password = input.password || "";
  const passwordErrors: string[] = [];
  if (!password) {
    passwordErrors.push("Password is required.");
  } else {
    if (password.length < 8) {
      passwordErrors.push("Be at least 8 characters long.");
    }
    if (!/[a-zA-Z]/.test(password)) {
      passwordErrors.push("Contain at least one letter.");
    }
    if (!/[0-9]/.test(password)) {
      passwordErrors.push("Contain at least one number.");
    }
  }

  if (passwordErrors.length > 0) {
    errors.password = passwordErrors;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates user login credentials.
 */
export function validateLoginInput(input: Partial<LoginInput>): {
  valid: boolean;
  errors: { email?: string[]; password?: string[] };
} {
  const errors: { email?: string[]; password?: string[] } = {};

  const email = (input.email || "").trim().toLowerCase();
  if (!email) {
    errors.email = ["Email is required."];
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = ["Please enter a valid email address."];
  }

  const password = input.password || "";
  if (!password) {
    errors.password = ["Password is required."];
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

