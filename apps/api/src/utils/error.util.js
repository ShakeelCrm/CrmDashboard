// Custom Error Class
export class AppError extends Error {
    statusCode;
    isOperational;
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
// Specific Error Types
export class ValidationError extends AppError {
    constructor(message = "Validation failed") {
        super(message, 400);
    }
}
export class AuthenticationError extends AppError {
    constructor(message = "Authentication failed") {
        super(message, 401);
    }
}
export class ConflictError extends AppError {
    constructor(message = "Resource already exists") {
        super(message, 409);
    }
}
export class NotFoundError extends AppError {
    constructor(message = "Resource not found") {
        super(message, 404);
    }
}
export class ServerError extends AppError {
    constructor(message = "Internal server error") {
        super(message, 500);
    }
}
