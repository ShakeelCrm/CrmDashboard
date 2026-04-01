import { getUserByEmail, createUser as createUserService } from "../services/user.service";
import { generateAccessToken } from "../utils/jwt.util";
import { comparePassword } from "../utils/password.util";
import { ValidationError, AuthenticationError, ConflictError, } from "../utils/error.util";
// @desc    Authenticate user & get token
// @route   POST /api/v1/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        // Validation
        if (!email || !password) {
            throw new ValidationError("Email and password are required");
        }
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new ValidationError("Please provide a valid email address");
        }
        // Check for user
        const user = await getUserByEmail(email);
        if (!user) {
            throw new AuthenticationError("Invalid email or password");
        }
        // Compare password with hashed password
        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            throw new AuthenticationError("Invalid email or password");
        }
        // Create token - convert id to string for JWT
        const tokenPayload = { id: user.id.toString(), email: user.email, type: "access" };
        const token = generateAccessToken(tokenPayload);
        // Return user info without password
        res.status(200).json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
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
        // Check if user exists
        const userExists = await getUserByEmail(email);
        if (userExists) {
            throw new ConflictError("A user with this email already exists");
        }
        // Create user (password will be hashed in the service)
        const user = await createUserService({ email, name, password });
        // Create token - convert id to string for JWT
        const tokenPayload = { id: user.id.toString(), email: user.email, type: "access" };
        const token = generateAccessToken(tokenPayload);
        // Return user info without password
        res.status(201).json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new AuthenticationError("User not authenticated");
        }
        res.status(200).json({
            success: true,
            data: {
                id: req.user.id,
                email: req.user.email,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
