# User Routes Documentation

## Overview
The User Routes module defines all user management endpoints for the CRM API. It includes routes for retrieving all users and creating new users with appropriate middleware for validation.

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
- `../controllers/user.controller`: User controller functions
- `../middleware/validation.middleware`: Validation middleware for input validation

### Purpose of Each Import
- `Router` from express: Creates a new router instance for organizing routes
- `getUsers, createUser` from user.controller: User management handler functions
- `validateUserCreation` from validation.middleware: User creation validation middleware

## Route Definitions

### userRoutes Router
```typescript
export const userRoutes = Router();
```
Creates a new Express router instance for user management routes.

## Middleware Applied

### Validation Middleware
- `validateUserCreation`: Applied to creation endpoint to validate email, name, and password

## Endpoint Details

### GET /
**Description**: Retrieves all users from the database.

**Controller Function**: `getUsers`

**Validation**: None

**Authentication**: None (public endpoint)

**Response**:
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

### POST /
**Description**: Creates a new user account with password hashing.

**Controller Function**: `createUser`

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
  "data": {
    "id": "user_id_string",
    "email": "newuser@example.com",
    "name": "New User",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

**Error Responses**:
- 400: Missing required fields or validation errors
- 400: Bad request during user creation
- 500: Server error during user creation

## Security Considerations

### Current Security Measures
- Input validation for user creation
- Password hashing in the service layer
- Passwords are not exposed in API responses
- Password strength requirements

### Security Features
- **Input Validation**: User data is validated before processing
- **Password Security**: Passwords are hashed and never exposed in responses
- **Data Protection**: Sensitive information is filtered from responses
- **Validation Requirements**: Enforces strong password policies

## Usage Examples

### Get All Users
```javascript
fetch('/api/v1/users')
.then(response => response.json())
.then(data => {
  if (data.success) {
    console.log(`Found ${data.count} users:`);
    console.log(data.data);
  }
});
```

### Create New User
```javascript
fetch('/api/v1/users', {
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
    console.log('User created successfully:', data.data);
  } else {
    console.error('User creation failed:', data.error);
  }
});
```

### Error Handling
```javascript
const createUser = async (userData) => {
  try {
    const response = await fetch('/api/v1/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Unknown error occurred');
    }
    
    return result;
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, error: error.message };
  }
};
```

## Integration Points

### With Controllers
- Connects routes to user controller functions
- Maps HTTP methods and paths to specific controller methods

### With Middleware
- Applies validation middleware to creation endpoint
- Ensures data integrity before processing

### With Application
- Mounted at `/api/v1/users` in the main application
- Part of the user management system for the CRM API

### With Services
- Calls user service functions for business logic
- Ensures proper validation before service layer operations