import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    // Safely parse body (may be empty because refresh token is httpOnly)
    let body: any = {};
    try { body = await request.json(); } catch (_err) { body = {}; }

    // Prefer token from request body, fallback to httpOnly cookie
    const cookieStore = await cookies();
    const existingRefreshToken = cookieStore.get("refresh_token")?.value;
    const refreshToken = body?.refreshToken || existingRefreshToken;

    if (!refreshToken) {
      return NextResponse.json(
        { error: "Refresh token is required" },
        { status: 400 }
      );
    }

    // Call the backend API to refresh the token (we can pass the cookie-derived token)
    const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const res = await fetch(`${BACKEND_URL}/api/v1/employees/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data?.error || data?.message || "Token refresh failed" },
        { status: res.status }
      );
    }

    // Use returned token or fallback to existing
    const tokenToUse = data.refreshToken || existingRefreshToken;

    // Update the cookies with new tokens
    const response = NextResponse.json(
      { 
        success: true,
        accessToken: data.accessToken,
        refreshToken: tokenToUse
      },
      { status: 200 }
    );

    // Set HTTP-only cookies for security
    response.cookies.set("access_token", data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 10 * 60 * 60, // 10 hours
      path: "/",
      sameSite: "strict",
    });

    if (tokenToUse) {
      response.cookies.set("refresh_token", tokenToUse, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 5 * 24 * 60 * 60, // 5 days
        path: "/",
        sameSite: "strict",
      });
    }

    return response;
  } catch (error: any) {
    console.error("Token refresh error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during token refresh" },
      { status: 500 }
    );
  }
}