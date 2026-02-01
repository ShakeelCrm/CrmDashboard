import { Request, Response, NextFunction } from "express";
import {
  loginEmployee,
  createEmployee as createEmployeeService,
  getEmployeeByEmail,
  getEmployeeById,
  refreshAccessToken,
  logoutEmployee,
  canEmployeeLogin
} from "../services/employee.service";
import { TokenPayload } from "../utils/jwt.util";
import {
  ValidationError,
  AuthenticationError,
  ConflictError,
  NotFoundError,
  ServerError,
} from "../utils/error.util";

interface LoginRequestBody {
  email: string;
  password: string;
}

// @desc    Authenticate employee & get tokens
// @route   POST /api/v1/employees/login
// @access  Public
export const loginEmployeeController = async (
  req: Request<{}, {}, LoginRequestBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      throw new ValidationError("Email and password are required");
    }

    // Check if email format is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError("Please provide a valid email address");
    }

    // Check if employee can login (single session enforcement)
    const employee = await getEmployeeByEmail(email);
    if (employee) {
      const canLogin = await canEmployeeLogin(employee.id.toString());
      if (!canLogin) {
        throw new AuthenticationError(
          "Employee is already logged in from another device. Please log out from other devices first."
        );
      }
    }

    // Attempt to login employee
    const result = await loginEmployee(email, password);

    // Return employee info and tokens
    res.status(200).json({
      success: true,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      employee: result.employee,
    });
  } catch (error) {
    next(error);
  }
};

interface RegisterRequestBody {
  email: string;
  name: string;
  password: string;
}

// @desc    Register employee
// @route   POST /api/v1/employees/register
// @access  Public
export const registerEmployeeController = async (
  req: Request<{}, {}, RegisterRequestBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, name, password } = req.body;

    // Validation
    if (!email || !name || !password) {
      throw new ValidationError("Email, name, and password are required");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError("Please provide a valid email address");
    }

    // Validate password strength
    if (password.length < 6) {
      throw new ValidationError("Password must be at least 6 characters long");
    }

    // Validate name length
    if (name.trim().length < 2) {
      throw new ValidationError("Name must be at least 2 characters long");
    }

    // Check if employee exists
    const employeeExists = await getEmployeeByEmail(email);

    if (employeeExists) {
      throw new ConflictError("An employee with this email already exists");
    }

    // Create employee (password will be hashed in the service)
    const employee = await createEmployeeService({ email, name, password });

    // Generate tokens for the newly registered employee
    const result = await loginEmployee(email, password);

    // Return employee info and tokens
    res.status(201).json({
      success: true,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      employee: result.employee,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh access token
// @route   POST /api/v1/employees/refresh-token
// @access  Public (uses refresh token)
export const refreshAccessTokenController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new ValidationError("Refresh token is required");
    }

    const result = await refreshAccessToken(refreshToken);

    res.status(200).json({
      success: true,
      accessToken: result.accessToken,
      employee: result.employee,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout employee
// @route   POST /api/v1/employees/logout
// @access  Public (uses refresh token)
export const logoutEmployeeController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get refresh token from request body
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new ValidationError("Refresh token is required");
    }

    const success = await logoutEmployee(refreshToken);

    if (!success) {
      throw new AuthenticationError("Failed to logout. Invalid or expired refresh token");
    }

    res.status(200).json({
      success: true,
      message: "Successfully logged out",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in employee
// @route   GET /api/v1/employees/me
// @access  Private
export const getEmployeeMe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AuthenticationError("Employee not authenticated");
    }

    // Get employee by ID from token
    // Convert the user ID to number for Prisma query
    const employeeId = typeof req.user.id === "string" ? parseInt(req.user.id, 10) : req.user.id;
    const employee = await getEmployeeById(employeeId);

    if (!employee) {
      throw new NotFoundError("Employee not found");
    }

    res.status(200).json({
      success: true,
      data: {
        id: employee.id,
        email: employee.email,
        name: employee.name,
      },
    });
  } catch (error) {
    next(error);
  }
};