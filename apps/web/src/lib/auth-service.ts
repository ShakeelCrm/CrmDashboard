"use client";

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
export async function logout() {
  try {
    const res = await fetch("/api/auth/logout", {
      method: "POST",
    });

    if (!res.ok) {
      const data = await res.json();
      console.error("Error logging out:", data.error || data.message);
    }
    
    // Clear any client-side cache if needed
    // For example, if you're storing user data in a global state
  } catch (error) {
    console.error("Network error during logout:", error);
  }
}

// Function to handle login
export async function login(credentials: { email: string; password: string }) {
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || data.message || "Login failed");
    }

    return { ok: true, user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken };
  } catch (error: any) {
    return { ok: false, error: error.message };
  }
}