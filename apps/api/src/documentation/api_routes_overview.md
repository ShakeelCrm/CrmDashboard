# API Routes Overview

## Complete Routes Structure

This document provides a comprehensive overview of all API routes in the CRM system.

## Routes Summary

### Base URL: `http://localhost:4000/api/v1`

---

## 1. Authentication Routes

**Base Path:** `/auth`

| Method | Endpoint | Authentication | Description |
|--------|----------|-----------------|-------------|
| POST | `/login` | None | User login - returns access token |
| POST | `/register` | None | User registration - auto login |
| GET | `/me` | Required | Get current user profile |

### Details: [Auth Routes](./auth_routes_details.md)

---

## 2. User Routes

**Base Path:** `/users`

| Method | Endpoint | Authentication | Description |
|--------|----------|-----------------|-------------|
| GET | `/` | None | Get all users |
| POST | `/` | None | Create new user |

### Details: [User Routes](./user_routes_details.md)

---

## 3. Employee Routes

**Base Path:** `/employees`

| Method | Endpoint | Authentication | Description |
|--------|----------|-----------------|-------------|
| POST | `/login` | None | Employee login - returns access & refresh tokens |
| POST | `/register` | None | Employee registration - auto login |
| POST | `/refresh-token` | None | Refresh access token using refresh token |
| POST | `/logout` | None | Logout employee - revoke refresh token |
| GET | `/me` | Required | Get current employee profile |

### Details: [Employee Routes](./employee_routes_details.md)

---

## Health Check

**Endpoint:** `GET /health`

**Description:** API health check endpoint

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2026-01-31T10:30:45.123Z"
}
```

---

## Global Error Handling

All routes benefit from centralized error handling. See [Error Handling System](./error_handling_system.md) for details.

---

## Authentication Headers

For endpoints marked as "Required", include:

```
Authorization: Bearer <accessToken>
```

Example:
```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  http://localhost:4000/api/v1/employees/me
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

---

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

---

## Testing All Endpoints

### 1. Health Check
```bash
curl http://localhost:4000/health
```

### 2. Register User
```bash
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","name":"User","password":"Pass123"}'
```

### 3. Login User
```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Pass123"}'
```

### 4. Get User Profile
```bash
curl http://localhost:4000/api/v1/auth/me \
  -H "Authorization: Bearer <accessToken>"
```

### 5. Get All Users
```bash
curl http://localhost:4000/api/v1/users
```

### 6. Create User
```bash
curl -X POST http://localhost:4000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@example.com","name":"New User","password":"Pass123"}'
```

### 7. Register Employee
```bash
curl -X POST http://localhost:4000/api/v1/employees/register \
  -H "Content-Type: application/json" \
  -d '{"email":"emp@example.com","name":"Employee","password":"EmpPass123"}'
```

### 8. Login Employee
```bash
curl -X POST http://localhost:4000/api/v1/employees/login \
  -H "Content-Type: application/json" \
  -d '{"email":"emp@example.com","password":"EmpPass123"}'
```

### 9. Get Employee Profile
```bash
curl http://localhost:4000/api/v1/employees/me \
  -H "Authorization: Bearer <empAccessToken>"
```

### 10. Refresh Employee Token
```bash
curl -X POST http://localhost:4000/api/v1/employees/refresh-token \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<refreshToken>"}'
```

### 11. Logout Employee
```bash
curl -X POST http://localhost:4000/api/v1/employees/logout \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<refreshToken>"}'
```

---

## Middleware Applied

### Global Middleware
- CORS enabled
- JSON body parser
- Express static files

### Route-Specific Middleware
- **`POST /api/v1/auth/register`** → `validateUserCreation`
- **`GET /api/v1/employees/me`** → `authenticateJWT`
- **`GET /api/v1/auth/me`** → `authenticateJWT`

### Application-Wide
- Error handler (last middleware)

---

## Best Practices

### 1. Always Include Content-Type Header
```bash
-H "Content-Type: application/json"
```

### 2. Include Authorization Token for Protected Routes
```bash
-H "Authorization: Bearer <token>"
```

### 3. Handle Error Responses
```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

### 4. Check Status Codes
- 2xx = Success
- 4xx = Client error
- 5xx = Server error

---

## Related Documentation

- [Error Handling System](./error_handling_system.md) - Comprehensive error handling
- [Auth Routes Details](./auth_routes_details.md) - User authentication
- [Employee Routes Details](./employee_routes_details.md) - Employee authentication
- [User Routes Details](./user_routes_details.md) - User management
- [Authentication Middleware](./auth_middleware_details.md) - JWT authentication
- [JWT Utilities](./jwt_util_details.md) - Token generation/verification
