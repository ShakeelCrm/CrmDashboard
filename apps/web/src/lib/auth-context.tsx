"use client";

import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";
import { refreshAccessToken, logout as logoutService, login as loginService } from "@/lib/auth-service";

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasCheckedAuth = useRef(false); // Track if we've done the initial auth check

  useEffect(() => {
    // Only check auth status on initial load if we haven't done it yet
    if (!hasCheckedAuth.current && !user) {
      hasCheckedAuth.current = true;
      checkAuthStatus();
    } else if (user) {
      // If we already have user data (e.g., from login), skip the initial check
      hasCheckedAuth.current = true;
      setIsLoading(false);
    }
  }, []); // Empty dependency array to run only once on mount

  const checkAuthStatus = async () => {
    try {
      const res = await fetch("/api/auth/session", {
        credentials: 'include'  // Ensure cookies are included in the request
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    const result = await loginService({ email, password });
    
    if (result.ok) {
      // Use the returned user data immediately
      setUser(result.user);
      setIsAuthenticated(true);
      hasCheckedAuth.current = true; // Mark that we've authenticated
      return result;
    } else {
      throw new Error(result.error);
    }
  };

  const handleLogout = async () => {
    await logoutService();
    setUser(null);
    setIsAuthenticated(false);
    hasCheckedAuth.current = false; // Reset auth check status
  };

  const value = {
    isAuthenticated,
    user,
    isLoading,
    login: handleLogin,
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