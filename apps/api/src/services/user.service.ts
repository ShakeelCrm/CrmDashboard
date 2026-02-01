import { prisma } from "@repo/database";
import { hashPassword } from "../utils/password.util";

interface UserInput {
  email: string;
  name: string;
  password: string;
}

// Define the return type based on Prisma's actual return
type PrismaUser = {
  id: number;
  email: string;
  name: string | null;
  password: string;
  createdAt: Date;
  updatedAt: Date;
};

// Service to get all users
export const getAllUsers = async (): Promise<PrismaUser[]> => {
  return await prisma.user.findMany();
};

// Service to create a new user
export const createUser = async ({ email, name, password }: UserInput): Promise<PrismaUser> => {
  const hashedPassword = await hashPassword(password);
  return await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
    },
  });
};

// Service to get a user by ID
export const getUserById = async (id: number | string): Promise<PrismaUser | null> => {
  const userId = typeof id === 'string' ? parseInt(id, 10) : id;
  return await prisma.user.findUnique({
    where: { id: userId },
  });
};

// Service to get a user by email
export const getUserByEmail = async (email: string): Promise<PrismaUser | null> => {
  return await prisma.user.findUnique({
    where: { email },
  });
};

// Service to update a user
export const updateUser = async (id: number | string, data: Partial<UserInput>): Promise<PrismaUser> => {
  const userId = typeof id === 'string' ? parseInt(id, 10) : id;
  if (data.password) {
    data.password = await hashPassword(data.password);
  }
  return await prisma.user.update({
    where: { id: userId },
    data,
  });
};

// Service to delete a user
export const deleteUser = async (id: number | string): Promise<PrismaUser> => {
  const userId = typeof id === 'string' ? parseInt(id, 10) : id;
  return await prisma.user.delete({
    where: { id: userId },
  });
};