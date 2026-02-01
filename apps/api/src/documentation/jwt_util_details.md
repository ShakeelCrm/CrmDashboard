# JWT Utilities Documentation

## Overview
The JWT Utilities module provides functions for generating and verifying JSON Web Tokens (JWTs) for authentication in the CRM API. It includes the TokenPayload interface definition and secure token operations.

## Table of Contents
1. [Overview](#overview)
2. [Imports and Dependencies](#imports-and-dependencies)
3. [Interface Definitions](#interface-definitions)
4. [Function Details](#function-details)
5. [Security Considerations](#security-considerations)
6. [Usage Examples](#usage-examples)
7. [Integration Points](#integration-points)

## Imports and Dependencies

### External Dependencies
- `jsonwebtoken`: Library for creating and verifying JWTs
- `typescript`: Provides type definitions for JWT operations

### Internal Dependencies
- `../config/env.config`: Configuration containing JWT secrets and expiration settings

### Purpose of Each Import
- `jwt` from jsonwebtoken: Provides sign and verify functions for JWT operations
- `config` from ../config/env.config: Provides JWT secret and expiration settings

## Interface Definitions

### TokenPayload
```typescript
export interface TokenPayload {
  id: string;
  email: string;
}
```
Defines the structure of data stored in JWT tokens, including user ID and email.

## Function Details

### generateToken(payload)
**Description**: Creates a signed JWT token with the provided payload.

**Parameters**:
- `payload` (TokenPayload): The data to embed in the token (typically user ID and email)

**Return Type**: `string`

**Process Flow**:
1. Signs the payload using the JWT secret from environment configuration
2. Sets the token expiration using the configured duration
3. Returns the signed token string

**Usage**:
```typescript
const tokenPayload = { id: 'user123', email: 'user@example.com' };
const token = generateToken(tokenPayload);
// Returns a JWT token string
```

### verifyToken(token)
**Description**: Verifies a JWT token and returns the embedded payload if valid.

**Parameters**:
- `token` (string): The JWT token to verify

**Return Type**: `TokenPayload | null`

**Process Flow**:
1. Attempts to verify the token using the JWT secret from environment configuration
2. If verification succeeds, returns the decoded payload
3. If verification fails (invalid/expired token), returns null

**Usage**:
```typescript
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
const payload = verifyToken(token);
// Returns { id: 'user123', email: 'user@example.com' } if valid, null if invalid
```

## Security Considerations

### Current Security Measures
- Uses a secret stored in environment variables for signing tokens
- Configurable token expiration times
- Secure verification process that handles invalid tokens gracefully

### Security Features
- **Token Signing**: Uses HMAC SHA256 algorithm for token signing
- **Expiration**: Tokens automatically expire after configured duration
- **Verification**: Secure verification process that handles tampering
- **Secret Management**: Uses environment variables for secret storage

### Best Practices Followed
- Never expose JWT secrets in client-side code
- Use strong, random secrets for signing
- Set appropriate expiration times for tokens
- Handle token verification failures gracefully

## Usage Examples

### Generating Tokens During Login
```javascript
import { generateToken } from '../utils/jwt.util';

// In authentication controller after successful login
const loginSuccess = async (user) => {
  const tokenPayload = {
    id: user.id,
    email: user.email
  };
  
  const token = generateToken(tokenPayload);
  return {
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name
    }
  };
};
```

### Verifying Tokens in Middleware
```javascript
import { verifyToken } from '../utils/jwt.util';

// In authentication middleware
const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
  
  req.user = decoded;
  next();
};
```

### Using Tokens in API Requests
```javascript
// Client-side usage
const makeAuthenticatedRequest = async (token) => {
  const response = await fetch('/api/protected-endpoint', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  return response.json();
};
```

## Integration Points

### With Authentication System
- Generates tokens during login and registration
- Verifies tokens in authentication middleware
- Provides user identification through token payloads

### With Controllers
- Used by auth controller for token generation
- Used by middleware for token verification
- Enables protected route access

### With Configuration
- Relies on environment configuration for secret and expiration settings
- Uses configurable expiration times for flexibility
- Supports different environments through config