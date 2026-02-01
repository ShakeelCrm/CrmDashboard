# Employee Routes Documentation

## Overview

The Employee Routes module handles all employee authentication and authorization operations. It includes endpoints for registration, login, token refresh, logout, and profile management.

## Base URL

```
/api/v1/employees
```

## Endpoints

### 1. Register Employee

**Endpoint:** `POST /api/v1/employees/register`

**Access:** Public

**Description:** Register a new employee with email, name, and password. Automatically logs in the employee upon successful registration.

**Request Body:**
```json
{
  "email": "employee@example.com",
  "name": "John Doe",
  "password": "securePassword123"
}
```

**Validation Rules:**
- Email is required and must be a valid email format
- Name is required and must be at least 2 characters
- Password is required and must be at least 6 characters
- Email must be unique (no existing employee with same email)

**Success Response (201 Created):**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "employee": {
    "id": 1,
    "email": "employee@example.com",
    "name": "John Doe"
  }
}
```

**Error Responses:**

- **400 Bad Request** - Validation failed
```json
{
  "success": false,
  "error": "Email, name, and password are required",
  "statusCode": 400
}
```

- **409 Conflict** - Employee already exists
```json
{
  "success": false,
  "error": "An employee with this email already exists",
  "statusCode": 409
}
```

---

### 2. Login Employee

**Endpoint:** `POST /api/v1/employees/login`

**Access:** Public

**Description:** Authenticate an employee and receive access and refresh tokens. Enforces single-session policy (login from new device revokes previous session).

**Request Body:**
```json
{
  "email": "employee@example.com",
  "password": "securePassword123"
}
```

**Validation Rules:**
- Email is required and must be valid format
- Password is required
- Employee must exist and be ACTIVE
- Password must match stored hash

**Success Response (200 OK):**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "employee": {
    "id": 1,
    "email": "employee@example.com",
    "name": "John Doe"
  }
}
```

**Error Responses:**

- **400 Bad Request** - Validation failed
```json
{
  "success": false,
  "error": "Email and password are required",
  "statusCode": 400
}
```

- **401 Unauthorized** - Invalid credentials or account disabled
```json
{
  "success": false,
  "error": "Invalid email or password",
  "statusCode": 401
}
```

- **400 Bad Request** - Already logged in from another device (single-session enforcement)
```json
{
  "success": false,
  "error": "Employee is already logged in from another device. Please log out from other devices first.",
  "statusCode": 400
}
```

---

### 3. Refresh Access Token

**Endpoint:** `POST /api/v1/employees/refresh-token`

**Access:** Public

**Description:** Generate a new access token using a refresh token. Use this when the access token expires.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Validation Rules:**
- Refresh token is required
- Refresh token must be valid and not expired
- Refresh token must not be revoked
- Employee must still be ACTIVE

**Success Response (200 OK):**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "employee": {
    "id": 1,
    "email": "employee@example.com",
    "name": "John Doe"
  }
}
```

**Error Responses:**

- **400 Bad Request** - Missing refresh token
```json
{
  "success": false,
  "error": "Refresh token is required",
  "statusCode": 400
}
```

- **401 Unauthorized** - Invalid or expired refresh token
```json
{
  "success": false,
  "error": "Invalid or expired refresh token",
  "statusCode": 401
}
```

---

### 4. Logout Employee

**Endpoint:** `POST /api/v1/employees/logout`

**Access:** Public

**Description:** Revoke the refresh token and log out the employee. The refresh token becomes invalid after logout.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Validation Rules:**
- Refresh token is required
- Refresh token must be valid and not already revoked

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Successfully logged out"
}
```

**Error Responses:**

- **400 Bad Request** - Missing or invalid refresh token
```json
{
  "success": false,
  "error": "Refresh token is required",
  "statusCode": 400
}
```

- **401 Unauthorized** - Failed to logout
```json
{
  "success": false,
  "error": "Failed to logout. Invalid or expired refresh token",
  "statusCode": 401
}
```

---

### 5. Get Current Employee Profile

**Endpoint:** `GET /api/v1/employees/me`

**Access:** Private (Requires valid access token)

**Description:** Retrieve the profile of the currently authenticated employee.

**Headers Required:**
```
Authorization: Bearer <accessToken>
```

**Example Request:**
```bash
curl -X GET http://localhost:4000/api/v1/employees/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "employee@example.com",
    "name": "John Doe"
  }
}
```

**Error Responses:**

- **401 Unauthorized** - Missing or invalid access token
```json
{
  "success": false,
  "error": "Employee not authenticated",
  "statusCode": 401
}
```

- **404 Not Found** - Employee record not found
```json
{
  "success": false,
  "error": "Employee not found",
  "statusCode": 404
}
```

---

## Token Details

### Access Token
- **Expiration:** 15 minutes
- **Type:** Used for API requests
- **Usage:** Include in Authorization header: `Bearer <accessToken>`

### Refresh Token
- **Expiration:** 7 days
- **Type:** Used to generate new access tokens
- **Usage:** Send in request body to `/refresh-token` endpoint
- **Storage:** Securely stored in database

## Authentication Flow

```
1. Register/Login
   ↓
2. Receive accessToken & refreshToken
   ↓
3. Use accessToken for API requests
   ↓ (when expires)
4. Use refreshToken to get new accessToken
   ↓
5. Continue with new accessToken
   ↓ (when done)
6. Call /logout with refreshToken
```

## Single-Session Enforcement

The employee system enforces single-session login:

- When an employee logs in, all previous refresh tokens are revoked
- Logging in from another device automatically logs out previous sessions
- Only one active session per employee at any time

## Security Features

✅ Passwords are hashed using bcrypt  
✅ Tokens are JWT-based with expiration  
✅ Single-session enforcement prevents multiple logins  
✅ Refresh tokens are stored in database and can be revoked  
✅ Employee account status is checked on each protected request  
✅ Generic error messages prevent user enumeration  

## Status Codes Reference

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized / Authentication Failed |
| 404 | Not Found |
| 409 | Conflict / Duplicate Resource |
| 500 | Internal Server Error |

## Example Workflow with cURL

### 1. Register
```bash
curl -X POST http://localhost:4000/api/v1/employees/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "name": "John Doe",
    "password": "SecurePass123"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:4000/api/v1/employees/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

### 3. Get Profile (use accessToken from response)
```bash
curl -X GET http://localhost:4000/api/v1/employees/me \
  -H "Authorization: Bearer <accessToken>"
```

### 4. Refresh Token (when access token expires)
```bash
curl -X POST http://localhost:4000/api/v1/employees/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "<refreshToken>"
  }'
```

### 5. Logout (use refreshToken)
```bash
curl -X POST http://localhost:4000/api/v1/employees/logout \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "<refreshToken>"
  }'
```
