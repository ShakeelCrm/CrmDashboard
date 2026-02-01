# Employee Authentication System

## Overview

The Employee Authentication System implements a secure login and signup mechanism for employees with access/refresh token management and single-session limitation. This system ensures that each employee can only be logged in from one device/session at a time.

## Features

### 1. Employee Registration and Login
- **Registration**: Allows new employees to create accounts with email, name, and password
- **Login**: Authenticates existing employees with email and password

### 2. Token-Based Authentication
- **Access Tokens**: Short-lived tokens (15 minutes by default) for API requests
- **Refresh Tokens**: Longer-lived tokens (7 days by default) for renewing access tokens
- **Secure Token Generation**: Uses separate secrets for access and refresh tokens

### 3. Single-Session Limitation
- **Enforcement**: Prevents employees from logging in multiple times simultaneously
- **Automatic Revocation**: Revokes existing refresh tokens when a new login occurs
- **Session Control**: Maintains only one active session per employee

### 4. Numeric ID Support
- **PostgreSQL Integration**: Uses auto-incrementing integer IDs instead of UUIDs
- **Flexible Handling**: Supports both numeric and string ID formats
- **Type Conversion**: Safely converts between numeric and string IDs as needed

## API Endpoints

### Authentication Endpoints

#### POST `/api/v1/employees/login`
Authenticate an employee and receive access/refresh tokens.

**Request Body:**
```json
{
  "email": "employee@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "employee": {
    "id": 123,
    "email": "employee@example.com",
    "name": "John Doe"
  }
}
```

#### POST `/api/v1/employees/register`
Register a new employee account.

**Request Body:**
```json
{
  "email": "employee@example.com",
  "name": "John Doe",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "employee": {
    "id": 123,
    "email": "employee@example.com",
    "name": "John Doe"
  }
}
```

#### POST `/api/v1/employees/refresh-token`
Exchange a refresh token for a new access token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response:**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "employee": {
    "id": 123,
    "email": "employee@example.com",
    "name": "John Doe"
  }
}
```

#### POST `/api/v1/employees/logout`
Logout the employee and revoke the refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully logged out"
}
```

#### GET `/api/v1/employees/me`
Get information about the currently authenticated employee.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "email": "employee@example.com",
    "name": "John Doe"
  }
}
```

## Implementation Details

### Employee Service (`employee.service.ts`)
- **loginEmployee**: Handles employee authentication, generates tokens, enforces single-session
- **createEmployee**: Registers new employees with password hashing
- **refreshAccessToken**: Validates refresh tokens and generates new access tokens
- **logoutEmployee**: Revokes refresh tokens to end sessions
- **canEmployeeLogin**: Checks if an employee can log in (single-session enforcement)
- **revokeAllRefreshTokens**: Revokes all existing refresh tokens for an employee

### JWT Utilities (`jwt.util.ts`)
- **generateAccessToken**: Creates short-lived access tokens
- **generateRefreshToken**: Creates longer-lived refresh tokens
- **verifyToken**: Validates tokens with support for both access and refresh token types
- **Token Expiration**: Configurable expiration times for different token types

### Authentication Middleware (`auth.middleware.ts`)
- **authenticateJWT**: Verifies access tokens and adds user info to request object
- **Token Type Verification**: Ensures proper token types are used for different endpoints

### Database Schema
- **Employee Model**: Stores employee information with auto-incrementing integer IDs
- **RefreshToken Model**: Tracks active refresh tokens with expiration and revocation support
- **Single-Session Enforcement**: Implemented through refresh token management

## Security Measures

### Token Security
- Separate secrets for access and refresh tokens
- Short-lived access tokens to minimize exposure window
- Secure refresh token storage in the database
- Automatic token revocation on logout

### Session Management
- Single-session enforcement prevents concurrent logins
- Automatic cleanup of expired tokens
- Secure password hashing with bcrypt

### Input Validation
- Comprehensive validation for all authentication endpoints
- Protection against common attacks (SQL injection, XSS, etc.)

## Configuration

The system uses environment variables for configuration:

- `JWT_SECRET`: Secret for signing access tokens
- `JWT_REFRESH_SECRET`: Separate secret for signing refresh tokens
- `JWT_ACCESS_EXPIRATION`: Access token expiration time (default: "15m")
- `JWT_REFRESH_EXPIRATION`: Refresh token expiration time (default: "7d")

## Error Handling

Common error responses include:
- **400 Bad Request**: Invalid credentials, missing fields, or invalid tokens
- **401 Unauthorized**: Missing or invalid access token
- **403 Forbidden**: Expired or invalid token
- **500 Internal Server Error**: Server-side issues

## Best Practices

- Always use HTTPS in production environments
- Regularly rotate JWT secrets
- Monitor active sessions and token usage
- Implement rate limiting for authentication endpoints
- Log authentication attempts for security auditing