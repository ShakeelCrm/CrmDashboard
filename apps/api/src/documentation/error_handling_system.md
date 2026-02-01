# Error Handling System Documentation

## Overview

The API implements a comprehensive, industry-standard error handling system with custom error classes, centralized error middleware, and consistent error responses across all endpoints.

## Architecture

### 1. Custom Error Classes (`src/utils/error.util.ts`)

All errors extend from a base `AppError` class which extends the standard Error class.

#### Available Error Types

```typescript
// Base Error Class
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
}

// Specific Error Types
- ValidationError (400) - Input validation failures
- AuthenticationError (401) - Authentication failures
- ConflictError (409) - Resource conflicts (e.g., duplicate email)
- NotFoundError (404) - Resource not found
- ServerError (500) - Unexpected server errors
```

#### Creating Custom Errors

```typescript
// ValidationError
throw new ValidationError("Email is required");

// AuthenticationError
throw new AuthenticationError("Invalid email or password");

// ConflictError
throw new ConflictError("User with this email already exists");

// NotFoundError
throw new NotFoundError("User not found");

// ServerError
throw new ServerError("Database connection failed");
```

### 2. Error Middleware (`src/middleware/error.middleware.ts`)

Centralized error handling middleware that catches all errors from route handlers.

#### Features

- **Catches all errors** from try-catch blocks via `next(error)`
- **Logs errors** with full context and timestamps
- **Returns consistent responses** with proper HTTP status codes
- **Handles unexpected errors** with fallback to 500 status

#### Error Response Format

```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

#### Example Logged Error

```
Error: {
  message: "Email is required",
  statusCode: 400,
  stack: "...",
  timestamp: "2026-01-31T10:30:45.123Z"
}
```

### 3. Controller Error Handling

All controllers follow this pattern:

```typescript
export const myController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validation
    if (!req.body.email) {
      throw new ValidationError("Email is required");
    }

    // Business logic
    const result = await someService();

    // Success response
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    // Pass error to middleware
    next(error);
  }
};
```

## Error Flow Diagram

```
Controller
    ↓
  Try Block
    ↓
  Validation/Business Logic
    ↓ (if error)
  Throw Custom Error
    ↓
  Catch Block
    ↓
  next(error) → Error Middleware
    ↓
  Log & Format Error
    ↓
  Send HTTP Response
```

## Usage Examples

### Example 1: Validation Error

**Request:**
```json
POST /api/v1/auth/login
{
  "email": "",
  "password": "test123"
}
```

**Controller Code:**
```typescript
if (!email) {
  throw new ValidationError("Email is required");
}
```

**Response:**
```json
HTTP 400 Bad Request
{
  "success": false,
  "error": "Email is required",
  "statusCode": 400
}
```

### Example 2: Authentication Error

**Controller Code:**
```typescript
if (!user) {
  throw new AuthenticationError("Invalid email or password");
}
```

**Response:**
```json
HTTP 401 Unauthorized
{
  "success": false,
  "error": "Invalid email or password",
  "statusCode": 401
}
```

### Example 3: Conflict Error

**Controller Code:**
```typescript
const userExists = await getUserByEmail(email);
if (userExists) {
  throw new ConflictError("A user with this email already exists");
}
```

**Response:**
```json
HTTP 409 Conflict
{
  "success": false,
  "error": "A user with this email already exists",
  "statusCode": 409
}
```

## Best Practices

### 1. **Always Throw Custom Errors**
```typescript
// ✅ Good
throw new ValidationError("Invalid input");

// ❌ Avoid
throw new Error("Invalid input");
```

### 2. **Use Appropriate Error Types**
```typescript
// ✅ Good - Use specific error types
if (!user) throw new NotFoundError("User not found");
if (userExists) throw new ConflictError("User already exists");

// ❌ Bad - Using wrong error type
if (!user) throw new AuthenticationError("User not found");
```

### 3. **Provide Clear Error Messages**
```typescript
// ✅ Good - Specific and actionable
throw new ValidationError("Email must be a valid format");

// ❌ Bad - Too generic
throw new ValidationError("Invalid input");
```

### 4. **Security: Don't Leak Information**
```typescript
// ✅ Good - Generic message for security
throw new AuthenticationError("Invalid email or password");

// ❌ Bad - Reveals user existence
throw new AuthenticationError("User with this email does not exist");
```

### 5. **Always Pass Error to Next Middleware**
```typescript
// ✅ Good
try {
  // logic
} catch (error) {
  next(error);
}

// ❌ Bad - Sending response directly
try {
  // logic
} catch (error) {
  res.status(500).json({ error: error.message });
}
```

## Adding Middleware to Routes

Error handling is applied globally in `app.ts`:

```typescript
// Error handling middleware (must be last)
app.use(errorHandler);
```

All routes automatically benefit from centralized error handling.

## Testing Error Scenarios

### Test Validation Error
```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"","password":""}'
```

Expected: 400 status with validation error message

### Test Not Found Error
```bash
curl http://localhost:4000/api/v1/users/99999
```

Expected: 404 status with not found message

### Test Conflict Error
```bash
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"existing@example.com","name":"John","password":"123456"}'
```

Expected: 409 status with conflict message

## Logging

All errors are logged to the console with:
- Error message
- HTTP status code
- Full stack trace
- Timestamp

This helps with debugging and monitoring in production.

## Future Enhancements

- [ ] Add structured logging (Winston, Pino)
- [ ] Add error tracking (Sentry)
- [ ] Add rate limiting for auth endpoints
- [ ] Add request validation schemas
- [ ] Add correlation IDs for request tracing
