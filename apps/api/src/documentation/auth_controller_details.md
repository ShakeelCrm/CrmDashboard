# Authentication Controller Detailed Documentation

## Table of Contents
1. [Overview](#overview)
2. [Imports and Dependencies](#imports-and-dependencies)
3. [Interface Definitions](#interface-definitions)
4. [Function Details](#function-details)
5. [Error Handling](#error-handling)
6. [Security Considerations](#security-considerations)
7. [Usage Examples](#usage-examples)
8. [Integration Points](#integration-points)

## Overview
The authentication controller handles all user authentication-related operations for the CRM API. It provides endpoints for user login, registration, and profile retrieval using JWT-based authentication. The controller follows the MVC pattern by delegating business logic to the user service layer while focusing on request/response handling.

## Imports and Dependencies

### External Dependencies
- `express`: Web framework providing Request and Response types
- `@repo/database`: Workspace package containing Prisma database client

### Internal Dependencies
- `../services/user.service`: Contains business logic for user operations
- `../utils/jwt.util`: Provides JWT token generation and verification functions
- `../utils/password.util`: Provides password hashing and comparison functions
- `../utils/jwt.util`: Provides TokenPayload interface definition

### Purpose of Each Import
- `Request, Response` from express: For type safety in route handlers
- `getUserByEmail, createUser` from user.service: For database operations
- `generateToken` from jwt.util: For creating authentication tokens
- `comparePassword` from password.util: For verifying user passwords during login
- `TokenPayload` from jwt.util: For type safety in token operations

## Interface Definitions

### LoginRequestBody
```typescript
interface LoginRequestBody {
  email: string;
  password: string; // In a real app, this would be hashed and verified
}
```
Defines the expected structure for login requests. Includes email and password fields.

### RegisterRequestBody
```typescript
interface RegisterRequestBody {
  email: string;
  name: string;
  password: string;
}
```
Defines the expected structure for registration requests. Includes email, name, and password fields.

### TokenPayload
Imported from jwt.util, defines the structure of JWT token payload:
```typescript
interface TokenPayload {
  id: string;
  email: string;
}
```

## Function Details

### loginUser(req, res)
**Description**: Authenticates a user and returns a JWT token if credentials are valid.

**Parameters**:
- `req` (Request<{}, {}, LoginRequestBody>): Express request object containing email and password in body
- `res` (Response): Express response object for sending back the result

**Process Flow**:
1. Extract email and password from request body
2. Validate that both email and password are provided
3. Check if user exists in database using email
4. Compare provided password with stored hashed password using bcrypt
5. Generate JWT token with user ID and email if credentials are valid
6. Return success response with token and user data (excluding password)

**Success Response**:
```json
{
  "success": true,
  "token": "JWT_TOKEN_STRING",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

**Error Responses**:
- 400: Missing email/password or invalid credentials
- 500: Server error during authentication

### registerUser(req, res)
**Description**: Registers a new user account with password hashing and returns a JWT token.

**Parameters**:
- `req` (Request<{}, {}, RegisterRequestBody>): Express request object containing email, name, and password
- `res` (Response): Express response object for sending back the result

**Process Flow**:
1. Extract email, name, and password from request body
2. Validate that all required fields are provided
3. Check if user already exists with the provided email
4. Create new user in database with hashed password (handled by user service)
5. Generate JWT token with user ID and email
6. Return success response with token and user data (excluding password)

**Success Response**:
```json
{
  "success": true,
  "token": "JWT_TOKEN_STRING",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

**Error Responses**:
- 400: Missing required fields or user already exists
- 500: Server error during registration

### getMe(req, res)
**Description**: Retrieves the profile of the currently authenticated user.

**Parameters**:
- `req` (Request): Express request object with authenticated user in req.user (set by auth middleware)
- `res` (Response): Express response object for sending back the result

**Process Flow**:
1. Check if user is authenticated (req.user exists)
2. Return user ID and email from the authenticated user object

**Success Response**:
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "email": "user@example.com"
  }
}
```

**Error Responses**:
- 401: User not authenticated

## Error Handling

### Common Error Types
- **Validation Errors**: Occur when required fields are missing
- **Authentication Errors**: Occur when credentials are invalid
- **Database Errors**: Occur during database operations
- **Server Errors**: Occur due to unexpected issues

### Error Response Format
All error responses follow the format:
```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details (optional)"
}
```

### Status Codes Used
- 400: Bad Request (validation errors, invalid credentials)
- 401: Unauthorized (authentication required but not provided)
- 500: Internal Server Error (unexpected server errors)

## Security Considerations

### Current Security Measures
- JWT-based authentication
- Input validation for required fields
- Email format validation (through middleware)
- Password hashing using bcrypt
- Password comparison during authentication
- Password strength validation (through middleware)

### Security Features Implemented
- **Password Hashing**: All passwords are hashed using bcrypt with salt rounds
- **Secure Comparison**: Passwords are compared using bcrypt's secure comparison
- **Password Strength**: Enforced minimum 8 characters with uppercase, lowercase, and number
- **Data Protection**: Passwords are not exposed in API responses

### Recommended Security Enhancements
- Rate limiting for authentication endpoints
- Input sanitization and validation
- HTTPS enforcement
- Token refresh mechanism
- Account lockout after failed attempts

### Token Security
- Tokens are signed with a secret stored in environment variables
- Tokens have configurable expiration times
- Tokens contain minimal user information (ID and email)

## Usage Examples

### Login Request Example
```javascript
// POST /api/v1/auth/login
const loginData = {
  email: 'user@example.com',
  password: 'securePassword123'
};

fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(loginData)
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    // Store token for future authenticated requests
    localStorage.setItem('authToken', data.token);
  } else {
    console.error('Login failed:', data.error);
  }
});
```

### Registration Request Example
```javascript
// POST /api/v1/auth/register
const registerData = {
  email: 'newuser@example.com',
  name: 'New User',
  password: 'securePassword123'
};

fetch('/api/v1/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(registerData)
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    // Store token for future authenticated requests
    localStorage.setItem('authToken', data.token);
  } else {
    console.error('Registration failed:', data.error);
  }
});
```

### Profile Retrieval Example
```javascript
// GET /api/v1/auth/me
// Requires Authorization header with JWT token
fetch('/api/v1/auth/me', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  }
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    console.log('Current user:', data.data);
  } else {
    console.error('Profile retrieval failed:', data.error);
  }
});
```

## Integration Points

### With Middleware
- Works with `authenticateJWT` middleware for protected routes
- Works with validation middleware for input validation

### With Services
- Integrates with `user.service` for database operations
- Uses `jwt.util` for token operations

### With Routes
- Connected to `/api/v1/auth` routes via `auth.route.ts`
- Part of the authentication workflow in the application

### With Database
- Uses Prisma client through `@repo/database` package
- Interacts with User model in the database
- Performs find, create operations on User records