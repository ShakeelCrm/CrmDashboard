import { handlers } from "@/auth";

// Export the NextAuth handlers for OAuth providers (if any are added later)
// Currently this only supports OAuth providers, not credentials
export const { GET, POST } = handlers;