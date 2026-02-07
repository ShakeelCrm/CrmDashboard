import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

/**
 * TEST ENDPOINT - Simulates NextAuth login flow
 * Use this to test authentication with Postman
 * 
 * POST http://localhost:3000/api/test/login
 * Body: { "email": "employee@example.com", "password": "password123" }
 */
export async function POST(request: Request) {
  try {
    const credentials = await request.json();
    const { email, password } = credentials;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Call Express backend - same as NextAuth authorize callback
    const res = await fetch(`${BACKEND_URL}/api/v1/employees/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data.error || data.message || "Login failed" },
        { status: res.status }
      );
    }

    // Return the same format as NextAuth would
    return NextResponse.json({
      success: true,
      user: {
        id: data.employee.id,
        email: data.employee.email,
        name: data.employee.name,
      },
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Test login endpoint",
    usage: "POST with { email, password }",
  });
}
