import NextAuth from "next-auth";

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

export const { handlers, auth } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    // Add other providers here if needed (Google, GitHub, etc.)
    // For now, we're removing the credentials provider since we're using custom API routes
  ],
  pages: {
    signIn: "/login", // Custom login page
  },
});