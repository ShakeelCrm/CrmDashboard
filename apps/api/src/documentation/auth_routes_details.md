# Auth Routes Documentation

## Overview
The Auth Routes module defines all authentication-related endpoints for the CRM API. It includes routes for user login, registration, and profile retrieval with appropriate middleware for validation and authentication.

## Table of Contents
1. [Overview](#overview)
2. [Imports and Dependencies](#imports-and-dependencies)
3. [Route Definitions](#route-definitions)
4. [Middleware Applied](#middleware-applied)
5. [Endpoint Details](#endpoint-details)
6. [Security Considerations](#security-considerations)
7. [Usage Examples](#usage-examples)
8. [Integration Points](#integration-points)

## Imports and Dependencies

### External Dependencies
- `express`: Web framework providing Router functionality

### Internal Dependencies
- `../controllers/auth.controller`: Authentication controller functions
- `../middleware/auth.middleware`: Authentication middleware for protected routes
- `../middleware/validation.middleware`: Validation middleware for input validation

### Purpose of Each Import
- `Router` from express: Creates a new router instance for organizing routes
- `loginUser, registerUser, getMe` from auth.controller: Authentication handler functions
- `authenticateJWT` from auth.middleware: JWT-based authentication middleware
- `validateUserCreation` from validation.middleware: User creation validation middleware

## Route Definitions

### authRoutes Router
```typescript
export const authRoutes = Router();
```
Creates a new Express router instance for authentication routes.

## Middleware Applied

### Validation Middleware
- `validateUserCreation`: Applied to registration endpoint to validate email, name, and password

### Authentication Middleware
- `authenticateJWT`: Applied to protected routes to verify JWT tokens

## Endpoint Details

### POST /login
**Description**: Authenticates a user and returns a JWT token.

**Controller Function**: `loginUser`

**Validation**: None (custom validation implemented in controller)

**Authentication**: None (public endpoint)

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response**:
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
- 400: Invalid credentials or missing fields
- 500: Server error during authentication

### POST /register
**Description**: Registers a new user account and returns a JWT token.

**Controller Function**: `registerUser`

**Validation**: `validateUserCreation` (email format, password strength, required fields)

**Authentication**: None (public endpoint)

**Request Body**:
```json
{
  "email": "newuser@example.com",
  "name": "New User",
  "password": "SecurePass123!"
}
```

**Response**:
```json
{
  "success": true,
  "token": "JWT_TOKEN_STRING",
  "user": {
    "id": "user_id",
    "email": "newuser@example.com",
    "name": "New User"
  }
}
```

**Error Responses**:
- 400: Validation errors or user already exists
- 500: Server error during registration

### GET /me
**Description**: Retrieves the profile of the currently authenticated user.

**Controller Function**: `getMe`

**Validation**: None

**Authentication**: `authenticateJWT` (requires valid JWT token)

**Headers**:
```
Authorization: Bearer JWT_TOKEN_STRING
```

**Response**:
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
- 403: Invalid or expired token

## Security Considerations

### Current Security Measures
- JWT-based authentication for protected routes
- Input validation for registration
- Password hashing in the service layer
- Secure password comparison during login
- Password strength requirements

### Security Features
- **Token Authentication**: Protected routes require valid JWT tokens
- **Input Validation**: Registration data is validated before processing
- **Password Security**: Passwords are hashed and never exposed in responses
- **Session Management**: Token-based authentication without server-side sessions

## Usage Examples

### Login Request
```javascript
fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'securePassword123'
  })
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    // Store token for future requests
    localStorage.setItem('authToken', data.token);
  }
});
```

### Registration Request
```javascript
fetch('/api/v1/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'newuser@example.com',
    name: 'New User',
    password: 'SecurePass123!'
  })
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    // Store token for future requests
    localStorage.setItem('authToken', data.token);
  }
});
```

### Profile Retrieval
```javascript
fetch('/api/v1/auth/me', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  }
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    console.log('User profile:', data.data);
  }
});
```

## Integration Points

### With Controllers
- Connects routes to authentication controller functions
- Maps HTTP methods and paths to specific controller methods

### With Middleware
- Applies validation middleware to registration
- Applies authentication middleware to protected routes
- Ensures security requirements are met

### With Application
- Mounted at `/api/v1/auth` in the main application
- Part of the authentication workflow for the CRM API