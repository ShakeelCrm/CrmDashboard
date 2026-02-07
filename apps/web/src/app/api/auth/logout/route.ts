import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    // Get the refresh token from cookies
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token")?.value;

    // Call the backend logout API if we have a refresh token
    if (refreshToken) {
      const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      await fetch(`${BACKEND_URL}/api/v1/employees/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });
    }

    // Clear the authentication cookies
    const response = NextResponse.json(
      { success: true, message: "Logged out successfully" },
      { status: 200 }
    );

    response.cookies.delete("access_token");
    response.cookies.delete("refresh_token");

    return response;
  } catch (error: any) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during logout" },
      { status: 500 }
    );
  }
}