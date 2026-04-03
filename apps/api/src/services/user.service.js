import { prisma } from "../database/db"; // Import the Prisma client instance
import { hashPassword } from "../utils/password.util";
// Service to get all users
export const getAllUsers = async () => {
    return await prisma.user.findMany();
};
// Service to create a new user
export const createUser = async ({ email, name, password }) => {
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
export const getUserById = async (id) => {
    const userId = typeof id === 'string' ? parseInt(id, 10) : id;
    return await prisma.user.findFirst({
        where: { id: userId },
    });
};
// Service to get a user by email
export const getUserByEmail = async (email) => {
    return await prisma.user.findFirst({
        where: { email },
    });
};
// Service to update a user
export const updateUser = async (id, data) => {
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
export const deleteUser = async (id) => {
    const userId = typeof id === 'string' ? parseInt(id, 10) : id;
    return await prisma.user.delete({
        where: { id: userId },
    });
};
