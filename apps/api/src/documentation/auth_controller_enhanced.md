# Auth Controller Documentation

## Overview

The Auth Controller handles user authentication operations including login, registration, and profile retrieval. It uses industry-standard error handling with proper validation and security measures.

## Architecture

```
Client Request
    ↓
Auth Controller (Request Handler)
    ↓
User Service (Business Logic)
    ↓
Database/Password Utils
    ↓
Token Generation
    ↓
Error Handler (if error)
    ↓
JSON Response
```

## Endpoints

### 1. POST /api/v1/auth/register

**Description:** Register a new user and return access token

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "securePassword123"
}
```

**Validation:**
- Email is required and must be valid format
- Name is required and at least 2 characters
- Password is required and at least 6 characters
- Email must be unique

**Success Response (201 Created):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Error Cases:**

| Error | Status | Message |
|-------|--------|---------|
| Missing fields | 400 | "Email, name, and password are required" |
| Invalid email | 400 | "Please provide a valid email address" |
| Short password | 400 | "Password must be at least 6 characters long" |
| Short name | 400 | "Name must be at least 2 characters long" |
| Duplicate email | 409 | "A user with this email already exists" |

---

### 2. POST /api/v1/auth/login

**Description:** Authenticate user and return access token

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Validation:**
- Email is required and must be valid format
- Password is required
- User must exist and password must match

**Success Response (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Error Cases:**

| Error | Status | Message |
|-------|--------|---------|
| Missing email/password | 400 | "Email and password are required" |
| Invalid email format | 400 | "Please provide a valid email address" |
| User not found | 401 | "Invalid email or password" |
| Wrong password | 401 | "Invalid email or password" |

---

### 3. GET /api/v1/auth/me

**Description:** Get current authenticated user's profile

**Authentication:** Required (Bearer token)

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

**Error Cases:**

| Error | Status | Message |
|-------|--------|---------|
| Missing token | 401 | "User not authenticated" |

---

## Implementation Details

### Error Handling Flow

All endpoints follow this pattern:

```typescript
export const controllerFunction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Validation
    if (!email) {
      throw new ValidationError("Email is required");
    }

    // 2. Business logic
    const user = await userService.login(email, password);

    // 3. Success response
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    // 4. Pass to error middleware
    next(error);
  }
};
```

### Error Types Used

```typescript
- ValidationError (400)    // Input validation fails
- AuthenticationError (401) // Login/password invalid
- ConflictError (409)      // Duplicate email
- ServerError (500)        // Unexpected errors
```

### Security Features

✅ Passwords hashed with bcrypt  
✅ Token-based authentication  
✅ Generic error messages (don't reveal user existence)  
✅ Email format validation  
✅ Password strength validation  
✅ Input validation middleware  

---

## Usage Examples

### Example 1: Register New User

**Request:**
```bash
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "name": "John Doe",
    "password": "SecurePass123"
  }'
```

**Response:**
```json
HTTP/1.1 201 Created
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJlbWFpbCI6ImpvaG5AZXhhbXBsZS5jb20iLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNjc0MzYyNDQ1LCJleHAiOjE2NzQzNjMzNDV9.7x8y9z0a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

---

### Example 2: Login User

**Request:**
```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

**Response:**
```json
HTTP/1.1 200 OK
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

---

### Example 3: Failed Login - Invalid Credentials

**Request:**
```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "WrongPassword"
  }'
```

**Response:**
```json
HTTP/1.1 401 Unauthorized
{
  "success": false,
  "error": "Invalid email or password",
  "statusCode": 401
}
```

---

### Example 4: Get Current User Profile

**Request:**
```bash
curl http://localhost:4000/api/v1/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
HTTP/1.1 200 OK
{
  "success": true,
  "data": {
    "id": 1,
    "email": "john@example.com"
  }
}
```

---

### Example 5: Validation Error

**Request:**
```bash
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "name": "J",
    "password": "pass"
  }'
```

**Response:**
```json
HTTP/1.1 400 Bad Request
{
  "success": false,
  "error": "Please provide a valid email address",
  "statusCode": 400
}
```

---

## Token Structure

Generated access tokens contain:
- **Payload:**
  - `id` - User ID
  - `email` - User email
  - `type` - "access"
  - `iat` - Issued at timestamp
  - `exp` - Expiration timestamp (15 minutes)

---

## Best Practices

### 1. Always Validate Input
```typescript
if (!email || !password) {
  throw new ValidationError("Email and password are required");
}
```

### 2. Use Appropriate Error Types
```typescript
// Security: Don't reveal if user exists
throw new AuthenticationError("Invalid email or password");
```

### 3. Never Log Sensitive Data
```typescript
// ❌ Bad - logs password
console.log({ email, password });

// ✅ Good - logs safe data
console.log({ email, timestamp });
```

### 4. Always Pass Errors to Middleware
```typescript
try {
  // logic
} catch (error) {
  next(error);  // ✅ Proper error handling
}
```

---

## Related Documentation

- [Error Handling System](./error_handling_system.md)
- [JWT Utilities](./jwt_util_details.md)
- [Password Utilities](./password_util_details.md)
- [Authentication Middleware](./auth_middleware_details.md)
- [Auth Routes](./auth_routes_details.md)
