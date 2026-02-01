# Authentication Middleware Documentation

## Overview
The Authentication Middleware provides JWT-based authentication for protected routes in the CRM API. It verifies the presence and validity of authentication tokens in incoming requests.

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
- `express`: Web framework providing Request, Response, and NextFunction types

### Internal Dependencies
- `../utils/jwt.util`: Provides JWT token verification functions
- `../utils/jwt.util`: Provides TokenPayload interface definition

### Purpose of Each Import
- `Request, Response, NextFunction` from express: For type safety in middleware
- `verifyToken` from jwt.util: For verifying JWT tokens
- `TokenPayload` from jwt.util: For type safety in token operations

## Function Details

### authenticateJWT(req, res, next)
**Description**: Verifies the JWT token in the Authorization header and attaches user information to the request object.

**Parameters**:
- `req` (Request): Express request object containing the Authorization header
- `res` (Response): Express response object for sending back error responses
- `next` (NextFunction): Express next function to continue the middleware chain

**Process Flow**:
1. Extract the Authorization header from the request
2. Parse the token from the "Bearer TOKEN" format
3. If no token is present, return 401 Unauthorized error
4. Verify the token using the JWT utility function
5. If token is invalid or expired, return 403 Forbidden error
6. If token is valid, attach the decoded user information to req.user
7. Call next() to continue the middleware chain

**Success Behavior**:
- Attaches user information to `req.user` property
- Continues to the next middleware/route handler

**Error Responses**:
- 401: Access token is required (no Authorization header or no token)
- 403: Invalid or expired token

## Error Handling

### Common Error Types
- **Missing Token Errors**: Occur when no Authorization header is present
- **Invalid Token Errors**: Occur when the token is malformed or invalid
- **Expired Token Errors**: Occur when the token has expired

### Error Response Format
Error responses follow the format:
```json
{
  "success": false,
  "message": "Error message"
}
```

### Status Codes Used
- 401: Unauthorized (missing token)
- 403: Forbidden (invalid/expired token)

## Security Considerations

### Current Security Measures
- Validates JWT tokens using a secret stored in environment variables
- Verifies token integrity and expiration
- Attaches user information to request object only after successful verification
- Prevents access to protected routes without valid tokens

### Security Features
- **Token Verification**: Ensures tokens are valid and not tampered with
- **Expiration Checking**: Automatically rejects expired tokens
- **User Identification**: Attaches verified user information to requests
- **Access Control**: Blocks unauthorized access to protected routes

## Usage Examples

### Applying to Protected Routes
```javascript
import { authenticateJWT } from '../middleware/auth.middleware';

// Apply to specific routes
app.get('/api/v1/profile', authenticateJWT, (req, res) => {
  // req.user is available here with user information
  res.json({ user: req.user });
});

// Apply to entire router
const protectedRouter = express.Router();
protectedRouter.use(authenticateJWT);

protectedRouter.get('/dashboard', (req, res) => {
  // req.user is available here
  res.json({ dashboard: 'data' });
});
```

### Using with Route Handlers
```javascript
// In a controller function
export const getProtectedData = async (req, res) => {
  // This function is protected by authenticateJWT middleware
  // req.user contains the authenticated user's information
  const userId = req.user.id;
  const userEmail = req.user.email;
  
  // Use the user information to fetch personalized data
  const data = await getUserSpecificData(userId);
  res.json({ success: true, data });
};
```

## Integration Points

### With Routes
- Applied to protected routes in route definitions
- Used as middleware in route handlers
- Integrated with authentication and user routes

### With Controllers
- Provides authenticated user information to controllers
- Enables personalized responses based on user identity
- Allows controllers to perform user-specific operations

### With JWT Utilities
- Uses JWT verification functions for token validation
- Relies on configuration from JWT utilities
- Follows the token payload structure defined in JWT utilities