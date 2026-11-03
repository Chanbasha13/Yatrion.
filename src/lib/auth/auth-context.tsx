"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { User, AuthResult } from "./auth-types";
import { migrateLocalTripToServer } from "@/lib/storage/user-trip-service";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, redirect?: string) => Promise<AuthResult>;
  signup: (name: string, email: string, password: string) => Promise<AuthResult>;
  loginDemo: () => Promise<AuthResult>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { method: "GET" });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user || null);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/me", { method: "GET" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active) {
          setUser(data?.user || null);
          if (data?.user && !data.user.isDemo) {
            void migrateLocalTripToServer(data.user.id);
          }
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setUser(null);
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const login = async (email: string, password: string, redirect?: string): Promise<AuthResult> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, redirect }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
        if (data.user && !data.user.isDemo) {
          void migrateLocalTripToServer(data.user.id);
        }
        return {
          success: true,
          user: data.user,
          redirectUrl: data.redirectUrl || "/app/dashboard",
        };
      }
      return {
        success: false,
        error: data.error || "Login failed.",
        fieldErrors: data.fieldErrors,
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Network error during login.",
      };
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<AuthResult> => {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
        if (data.user && !data.user.isDemo) {
          void migrateLocalTripToServer(data.user.id);
        }
        return {
          success: true,
          user: data.user,
          redirectUrl: data.redirectUrl || "/app/dashboard",
        };
      }
      return {
        success: false,
        error: data.error || "Registration failed.",
        fieldErrors: data.fieldErrors,
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Network error during registration.",
      };
    }
  };

  const loginDemo = async (): Promise<AuthResult> => {
    try {
      const res = await fetch("/api/auth/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
        if (data.user && !data.user.isDemo) {
          void migrateLocalTripToServer(data.user.id);
        }
        return {
          success: true,
          user: data.user,
          redirectUrl: data.redirectUrl || "/app/dashboard",
        };
      }
      return {
        success: false,
        error: data.error || "Failed to start demo session.",
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Network error starting demo.",
      };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
      if (typeof window !== "undefined") {
        window.location.replace("/login");
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        loginDemo,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
