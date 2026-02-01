import { headers } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function serverFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headersList = await headers();
  // Extract the cookie or Authorization header from the incoming user request
  const cookie = headersList.get("cookie") || "";
  const authHeader = headersList.get("authorization") || "";

  const url = `${BACKEND_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie, // Forward cookies (session)
      Authorization: authHeader, // Forward Bearer token
      ...options.headers,
    },
    cache: "no-store", // Default to no-store for dynamic data
  });

  if (!res.ok) {
    throw new Error(`Server Fetch Failed: ${res.status} ${res.statusText}`);
  }

  return res.json();
}