"use client";

import { signIn, signOut as nextAuthSignOut } from "next-auth/react";

// Function to refresh access token using refresh token
export async function refreshAccessToken(refreshToken: string) {
  try {
    const res = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || data.message || "Token refresh failed");
    }

    return data;
  } catch (error: any) {
    console.error("Error refreshing token:", error);
    throw error;
  }
}

// Function to handle logout
export async function logout(refreshToken?: string) {
  if (refreshToken) {
    // Revoke the refresh token on the server
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error("Error revoking refresh token:", data.error || data.message);
      }
    } catch (error) {
      console.error("Network error revoking refresh token:", error);
      // Continue with signOut even if token revocation fails
    }
  }

  // Sign out from NextAuth
  await nextAuthSignOut({ callbackUrl: "/login" });
}

// Function to handle login
export async function login(credentials: { email: string; password: string }) {
  const result = await signIn("credentials", {
    ...credentials,
    redirect: false,
  });

  return result;
}