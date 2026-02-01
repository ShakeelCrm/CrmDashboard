import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    // Forward refresh token request to Express Employee Refresh Endpoint
    const res = await fetch(`${API_URL}/employees/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await res.json();

    if (!res.ok) {
      // Handle the new error response format from the backend
      return NextResponse.json(
        {
          success: false,
          error: data.error || data.message || "Token refresh failed"
        },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal Server Error"
      },
      { status: 500 }
    );
  }
}