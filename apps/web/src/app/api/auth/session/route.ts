import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    const cookieStore = cookies();
    const accessToken = (await cookieStore).get("access_token");

    if (!accessToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Validate the token with the backend
    const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const res = await fetch(`${BACKEND_URL}/api/v1/employees/me`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken.value}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userData = await res.json();
    
    // Handle different response structures from the backend
    // Session API returns user data under 'data', login API under 'employee'
    const user = userData.employee || userData.data || (userData.data && userData.data.employee);
    
    return NextResponse.json({
      user: user, // Return actual user data from the backend
      isAuthenticated: true
    });
  } catch (error) {
    console.error("Session check error:", error);
    return NextResponse.json({ error: "Failed to check session" }, { status: 500 });
  }
}