import { prisma } from "../database/db"; // Import the Prisma client instance
import { hashPassword, comparePassword } from "../utils/password.util";
import { generateAccessToken, generateRefreshToken, verifyToken } from "../utils/jwt.util";
import { AuthenticationError, ValidationError, } from "../utils/error.util";
// Service to get all employees
export const getAllEmployees = async () => {
    return await prisma.employee.findMany();
};
// Service to create a new employee
export const createEmployee = async ({ email, name, password }) => {
    const hashedPassword = await hashPassword(password);
    return await prisma.employee.create({
        data: {
            email,
            name,
            password: hashedPassword,
            status: "DISABLED",
        },
    });
};
// Service to get an employee by ID
export const getEmployeeById = async (id) => {
    const employeeId = typeof id === 'string' ? parseInt(id, 10) : id;
    return await prisma.employee.findUnique({
        where: { id: employeeId },
    });
};
// Service to get an employee by email
export const getEmployeeByEmail = async (email) => {
    return await prisma.employee.findUnique({
        where: { email },
    });
};
// Service to update an employee
export const updateEmployee = async (id, data) => {
    const employeeId = typeof id === 'string' ? parseInt(id, 10) : id;
    if (data.password) {
        data.password = await hashPassword(data.password);
    }
    return await prisma.employee.update({
        where: { id: employeeId },
        data,
    });
};
// Service to delete an employee
export const deleteEmployee = async (id) => {
    const employeeId = typeof id === 'string' ? parseInt(id, 10) : id;
    return await prisma.employee.delete({
        where: { id: employeeId },
    });
};
// Service to login an employee and generate tokens
export const loginEmployee = async (email, password) => {
    // Find employee by email
    const employee = await getEmployeeByEmail(email);
    if (!employee) {
        throw new AuthenticationError("Invalid email or password");
    }
    // Check if employee is active
    if (employee.status !== "ACTIVE") {
        throw new AuthenticationError("Employee account is disabled");
    }
    // Compare password with hashed password
    const isPasswordValid = await comparePassword(password, employee.password);
    if (!isPasswordValid) {
        throw new AuthenticationError("Invalid email or password");
    }
    // Revoke all existing refresh tokens for this employee to enforce single session
    await revokeAllRefreshTokens(employee.id.toString());
    // Generate new tokens
    const accessTokenPayload = { id: employee.id.toString(), email: employee.email, type: "access" };
    const refreshTokenPayload = { id: employee.id.toString(), email: employee.email, type: "refresh" };
    const accessToken = generateAccessToken(accessTokenPayload);
    const refreshToken = generateRefreshToken(refreshTokenPayload);
    // Store the refresh token in the database
    await prisma.refreshToken.create({
        data: {
            token: refreshToken,
            employeeId: employee.id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
    });
    return {
        employee: {
            id: employee.id,
            email: employee.email,
            name: employee.name,
        },
        accessToken,
        refreshToken,
    };
};
// Service to refresh access token using refresh token
export const refreshAccessToken = async (refreshToken) => {
    // Verify the refresh token
    const decoded = verifyToken(refreshToken, "refresh");
    if (!decoded) {
        throw new AuthenticationError("Invalid or expired refresh token");
    }
    // Convert the decoded ID to number for Prisma query
    const employeeId = typeof decoded.id === 'string' ? parseInt(decoded.id, 10) : decoded.id;
    if (isNaN(employeeId)) {
        throw new ValidationError("Invalid employee ID in token");
    }
    // Find the refresh token in the database
    const storedToken = await prisma.refreshToken.findFirst({
        where: {
            token: refreshToken,
            employeeId: employeeId,
            revokedAt: null, // Ensure token hasn't been revoked
            expiresAt: {
                gt: new Date(), // Ensure token hasn't expired
            },
        },
        include: {
            Employee: true,
        },
    });
    if (!storedToken || !storedToken.Employee) {
        throw new AuthenticationError("Invalid Er expired refresh token");
    }
    // Check if Employee is still active
    if (storedToken.Employee.status !== "ACTIVE") {
        throw new AuthenticationError("Employee account is disabled");
    }
    // Generate new access token
    const newAccessTokenPayload = {
        id: storedToken.Employee.id.toString(),
        email: storedToken.Employee.email,
        type: "access"
    };
    const newAccessToken = generateAccessToken(newAccessTokenPayload);
    return {
        employee: {
            id: storedToken.Employee.id,
            email: storedToken.Employee.email,
            name: storedToken.Employee.name,
        },
        accessToken: newAccessToken,
        refreshToken: refreshToken,
    };
};
// Service to logout an employee (revoke refresh token)
export const logoutEmployee = async (refreshToken) => {
    // Find and revoke the refresh token
    const result = await prisma.refreshToken.updateMany({
        where: {
            token: refreshToken,
            revokedAt: null,
        },
        data: {
            revokedAt: new Date(),
        },
    });
    return result.count > 0;
};
// Service to revoke all refresh tokens for an employee (for single session enforcement)
export const revokeAllRefreshTokens = async (employeeId) => {
    const id = typeof employeeId === 'string' ? parseInt(employeeId, 10) : employeeId;
    await prisma.refreshToken.updateMany({
        where: {
            employeeId: id,
            revokedAt: null,
        },
        data: {
            revokedAt: new Date(),
        },
    });
};
// Service to check if employee can login (single session enforcement)
export const canEmployeeLogin = async (employeeId) => {
    // Convert employeeId to number for Prisma query
    const id = typeof employeeId === 'string' ? parseInt(employeeId, 10) : employeeId;
    // Check if there are any active refresh tokens for this employee
    const activeTokens = await prisma.refreshToken.count({
        where: {
            employeeId: id,
            revokedAt: null,
            expiresAt: {
                gt: new Date(),
            },
        },
    });
    // If there are active tokens, the employee is already logged in
    return activeTokens === 0;
};
// Service to cleanup expired refresh tokens
export const cleanupExpiredTokens = async () => {
    try {
        const result = await prisma.refreshToken.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date(),
                },
            },
        });
        console.log(`[Token Cleanup] Removed ${result.count} expired tokens`);
        return result.count;
    }
    catch (error) {
        console.error("[Token Cleanup Error]", error);
        return 0;
    }
};
