import { AppError } from "../utils/error.util";
// Error handling middleware
export const errorHandler = (err, req, res, next) => {
    // Log the full error for debugging
    console.error("Error:", {
        message: err.message,
        statusCode: err.statusCode || 500,
        stack: err.stack,
        timestamp: new Date().toISOString(),
    });
    // Handle custom AppError
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            error: err.message,
            statusCode: err.statusCode,
        });
    }
    // Handle unexpected errors
    res.status(500).json({
        success: false,
        error: "Internal Server Error",
        statusCode: 500,
    });
};
