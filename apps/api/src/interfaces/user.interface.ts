// This interface represents the shape of the Prisma User model
// The actual types will be inferred from the Prisma client
export interface User {
  id: string; // Prisma typically uses string IDs (cuid)
  email: string;
  name: string | null;
  password: string; // Hashed password
  createdAt: Date;
  updatedAt: Date;
}