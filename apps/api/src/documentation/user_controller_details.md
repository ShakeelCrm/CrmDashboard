# User Controller Documentation

## Overview
The User Controller handles all user-related operations for the CRM API. It provides endpoints for retrieving all users and creating new users, with proper validation and security measures.

## Table of Contents
1. [Overview](#overview)
2. [Imports and Dependencies](#imports-and-dependencies)
3. [Function Details](#function-details)
4. [Error Handling](#error-handling)
5. [Security Considerations](#security-considerations)
6. [Usage Examples](#usage-examples)
7. [Integration Points](#integration-points)

## Imports and Dependencies

### External Dependencies
- `express`: Web framework providing Request and Response types

### Internal Dependencies
- `../services/user.service`: Contains business logic for user operations
- `../utils/password.util`: Provides password hashing functions (used indirectly via service)

### Purpose of Each Import
- `Request, Response` from express: For type safety in route handlers
- `getAllUsers, createUser` from user.service: For database operations and business logic

## Function Details

### getUsers(req, res)
**Description**: Retrieves all users from the database.

**Parameters**:
- `req` (Request): Express request object
- `res` (Response): Express response object for sending back the result

**Process Flow**:
1. Call the `getAllUsers` service function to retrieve all users
2. Format the response with success status and user data
3. Include count of retrieved users
4. Send successful response

**Success Response**:
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": "user_id_1",
      "email": "user1@example.com",
      "name": "User One",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

**Error Responses**:
- 500: Server error during user retrieval

### createUser(req, res)
**Description**: Creates a new user account with password hashing.

**Parameters**:
- `req` (Request): Express request object containing email, name, and password in body
- `res` (Response): Express response object for sending back the result

**Process Flow**:
1. Extract email, name, and password from request body
2. Validate that all required fields are provided
3. Call the `createUser` service function to create the user (password will be hashed)
4. Exclude password from response for security
5. Return success response with user data

**Success Response**:
```json
{
  "success": true,
  "data": {
    "id": "user_id_string",
    "email": "user@example.com",
    "name": "User Name",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

**Error Responses**:
- 400: Missing required fields (email, name, password)
- 400: Bad request during user creation
- 500: Server error during user creation

## Error Handling

### Common Error Types
- **Validation Errors**: Occur when required fields are missing
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
- 400: Bad Request (validation errors)
- 500: Internal Server Error (unexpected server errors)

## Security Considerations

### Current Security Measures
- Password hashing occurs in the service layer before storage
- Passwords are excluded from API responses for security
- Input validation for required fields

### Security Features
- **Password Protection**: Passwords are never exposed in API responses
- **Data Validation**: Required fields are validated before processing
- **Service Layer Security**: Password hashing happens at the service level

## Usage Examples

### Get All Users Example
```javascript
// GET /api/v1/users
fetch('/api/v1/users')
.then(response => response.json())
.then(data => {
  if (data.success) {
    console.log('Users retrieved:', data.data);
    console.log('Total users:', data.count);
  } else {
    console.error('Failed to retrieve users:', data.error);
  }
});
```

### Create User Example
```javascript
// POST /api/v1/users
const userData = {
  email: 'newuser@example.com',
  name: 'New User',
  password: 'SecurePassword123!'
};

fetch('/api/v1/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(userData)
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    console.log('User created successfully:', data.data);
  } else {
    console.error('User creation failed:', data.error);
  }
});
```

## Integration Points

### With Services
- Integrates with `user.service` for database operations
- Leverages password hashing through the service layer

### With Routes
- Connected to `/api/v1/users` routes via `user.route.ts`
- Part of the user management workflow in the application

### With Database
- Uses Prisma client through `@repo/database` package
- Interacts with User model in the database
- Performs find, create operations on User records