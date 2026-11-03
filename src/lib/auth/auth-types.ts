/**
 * Yatrion Authentication Types
 * Part 11A · Phase 1: Secure Authentication Engine & Foundation
 */

export interface User {
  id: string;
  email: string;
  name: string;
  isDemo?: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface UserRecord extends User {
  passwordHash: string;
}

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  isDemo: boolean;
  iat?: number;
  exp?: number;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
  fieldErrors?: {
    name?: string[];
    email?: string[];
    password?: string[];
  };
  redirectUrl?: string;
}

export interface SignupInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
  redirect?: string;
}

