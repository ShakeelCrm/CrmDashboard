import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth"; // Import auth helper

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function proxy(request: NextRequest, { params }: { params: { path: string[] } }) {
  const session = await auth(); // <--- GET SESSION SERVER-SIDE
  
  // Await params in Next.js 15/16
  const resolvedParams = await params;
  const path = resolvedParams.path.join("/");
  const searchParams = request.nextUrl.search;
  const fullUrl = `${API_URL}/${path}${searchParams}`;

  const headers = new Headers(request.headers);
  headers.set("Host", new URL(API_URL).host);

  // 🚀 INJECT TOKEN: If user is logged in, attach the token for Express
  if (session && (session as any).accessToken) {
    headers.set("Authorization", `Bearer ${(session as any).accessToken}`);
  }

  try {
    const response = await fetch(fullUrl, {
      method: request.method,
      headers: headers,
      body: request.body, 
    } as RequestInit);

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  } catch (error) {
    return NextResponse.json({ error: "Backend unreachable" }, { status: 502 });
  }
}

export { proxy as GET, proxy as POST, proxy as PUT, proxy as DELETE };