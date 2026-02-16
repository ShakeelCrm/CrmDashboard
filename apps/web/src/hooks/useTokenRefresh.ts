"use client";

import { useEffect, useRef, useCallback } from "react";

export function useTokenRefresh() {
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRefreshingRef = useRef(false);

  const scheduleTokenRefresh = useCallback((token: string) => {
    try {
      // Parse JWT without verification (we trust it came from secure cookie)
      const parts = token.split(".");
      if (parts.length !== 3) {
        console.error("Invalid token format");
        return;
      }

      // Decode the payload
      const payload = JSON.parse(
        Buffer.from(parts[1], "base64").toString("utf-8")
      );
      
      if (!payload.exp) {
        console.error("Token missing expiration");
        return;
      }

      const expiresAt = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      const timeUntilExpiry = expiresAt - now;

      // Refresh 30 minutes before expiration (or 50% of token life for short tokens like testing)
      // Never use a buffer longer than 50% of token lifetime
      const bufferTime = Math.min(
        30 * 60 * 1000, // 30 minute max
        Math.max(1000, timeUntilExpiry * 0.5) // 1 second min, but cap at 50% of token life
      );
      const refreshTime = Math.max(100, timeUntilExpiry - bufferTime);

      // Clear existing timeout
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }

      // Only schedule if time is positive
      if (refreshTime > 0) {
        console.log(`[Token Refresh] Scheduled refresh in ${(refreshTime / 1000).toFixed(2)}s (buffer: ${(bufferTime / 1000).toFixed(2)}s, expires in: ${(timeUntilExpiry / 1000).toFixed(2)}s)`);
        refreshTimeoutRef.current = setTimeout(async () => {
          if (isRefreshingRef.current) {
            return; // Prevent concurrent refresh attempts
          }

          isRefreshingRef.current = true;
          try {
            console.log("[Token Refresh] Executing token refresh...");
            const response = await fetch("/api/auth/refresh", {
              method: "POST",
              credentials: "include",
            });

            const data = await response.json();

            if (response.ok && data.accessToken) {
              // Token refreshed successfully, schedule next refresh
              console.log("[Token Refresh] ✓ Token refreshed successfully");
              scheduleTokenRefresh(data.accessToken);
            } else {
              // Refresh failed, try again in 5 minutes
              console.warn("Token refresh failed, retrying...");
              refreshTimeoutRef.current = setTimeout(() => {
                scheduleTokenRefresh(token);
              }, 5 * 60 * 1000);
            }
          } catch (error) {
            console.error("Error refreshing token:", error);
            // Retry in 5 minutes on error
            refreshTimeoutRef.current = setTimeout(() => {
              scheduleTokenRefresh(token);
            }, 5 * 60 * 1000);
          } finally {
            isRefreshingRef.current = false;
          }
        }, refreshTime);
      }
    } catch (error) {
      console.error("Error scheduling token refresh:", error);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  return { scheduleTokenRefresh };
}
