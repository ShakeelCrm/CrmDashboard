"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useSession } from "next-auth/react";
import { refreshAccessToken, logout as logoutService } from "@/lib/auth-service";

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // TODO: Store refresh token in a secure way (e.g., httpOnly cookie or secure storage)
  // For now, we'll assume it's stored in localStorage (not ideal for production)
  const getStoredRefreshToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("refreshToken");
    }
    return null;
  };

  const setStoredRefreshToken = (token: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("refreshToken", token);
    }
  };

  const removeStoredRefreshToken = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("refreshToken");
    }
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      if (status === "authenticated" && session) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    checkAuthStatus();
  }, [status, session]);

  const handleLogout = async () => {
    const refreshToken = getStoredRefreshToken();
    await logoutService(refreshToken);
    removeStoredRefreshToken();
  };

  const value = {
    isAuthenticated,
    user: session?.user,
    isLoading,
    logout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}