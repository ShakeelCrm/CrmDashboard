import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

// Extend NextAuth User, Session, and JWT types to include custom fields
declare module "next-auth" {
  interface User {
    accessToken?: string;
    refreshToken?: string;
  }

  interface Session {
    accessToken?: string;
    refreshToken?: string;
  }

  interface JWT {
    accessToken?: string;
    refreshToken?: string;
  }
}

// Your Express Backend URL
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // 1. LOGIN LOGIC: NextAuth calls Express Employee Auth
      authorize: async (credentials) => {
        try {
          const res = await fetch(`${BACKEND_URL}/api/v1/employees/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
          });

          const data = await res.json();

          if (!res.ok) {
            // Get the error message from backend and return null to trigger error
            const errorMessage = data?.error || data?.message || "Invalid email or password";
            console.error("Backend error:", errorMessage);
            return null;
          }

          // Return user with tokens: { id, email, name, accessToken, refreshToken }
          return {
            id: data.employee.id,
            email: data.employee.email,
            name: data.employee.name,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          };
        } catch (e: any) {
          console.error("Login error:", e);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    // 2. JWT CALLBACK: Store tokens and user info in the JWT
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
      }
      return token;
    },
    // 3. SESSION CALLBACK: Expose tokens and user to the Client
    async session({ session, token }) {
      (session.user as any).id = token.id;
      (session.user as any).email = token.email;
      (session.user as any).name = token.name;
      session.accessToken = (token.accessToken as string | undefined);
      session.refreshToken = (token.refreshToken as string | undefined);
      return session;
    },
  },
  pages: {
    signIn: "/login", // Custom login page
  },
});