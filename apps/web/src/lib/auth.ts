import { cookies } from "next/headers";

export interface SessionData {
  user: any;
  accessToken: string;
  refreshToken: string;
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (!accessToken || !refreshToken) {
    return null;
  }

  // In a real implementation, you might want to validate the token with your backend
  // For now, we'll just return the stored tokens
  return {
    user: null, // This would come from token decoding or a backend call
    accessToken,
    refreshToken
  };
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return !!session;
}