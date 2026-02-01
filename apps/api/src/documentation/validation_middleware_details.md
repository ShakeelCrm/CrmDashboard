# Validation Middleware Documentation

## Overview
The Validation Middleware provides input validation for various operations in the CRM API. It includes functions for validating email formats, password strength, required fields, and specific validation for user creation.

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
- None

### Purpose of Each Import
- `Request, Response, NextFunction` from express: For type safety in middleware functions

## Function Details

### validateEmail(email)
**Description**: Validates the format of an email address using a regular expression.

**Parameters**:
- `email` (string): The email address to validate

**Return Type**: `boolean`

**Process Flow**:
1. Tests the email against a standard email format regular expression
2. Returns true if the email format is valid, false otherwise

**Usage**:
```typescript
const isValid = validateEmail('user@example.com'); // Returns true
const isInvalid = validateEmail('invalid-email'); // Returns false
```

### validatePassword(password)
**Description**: Validates the strength of a password using a regular expression.

**Parameters**:
- `password` (string): The password to validate

**Return Type**: `boolean`

**Process Flow**:
1. Tests the password against a strength regular expression
2. Checks for minimum 8 characters with at least one uppercase, lowercase, and number
3. Returns true if the password meets strength requirements, false otherwise

**Usage**:
```typescript
const isValid = validatePassword('SecurePass123!'); // Returns true
const isInvalid = validatePassword('weak'); // Returns false
```

### validateRequiredFields(obj, requiredFields)
**Description**: Checks if all required fields are present in an object.

**Parameters**:
- `obj` (Record<string, any>): The object to check
- `requiredFields` (string[]): Array of field names that are required

**Return Type**: `string[]`

**Process Flow**:
1. Iterates through the required fields array
2. Checks if each field exists in the object
3. Returns an array of missing field names

**Usage**:
```typescript
const missing = validateRequiredFields({ email: 'test@example.com' }, ['email', 'name']);
// Returns ['name'] since 'name' is missing
```

### validateUserCreation(req, res, next)
**Description**: Validates user creation input including email format and password strength.

**Parameters**:
- `req` (Request): Express request object containing user data in body
- `res` (Response): Express response object for sending back validation errors
- `next` (NextFunction): Express next function to continue the middleware chain

**Process Flow**:
1. Extracts email, name, and password from request body
2. Checks if all required fields (email, name, password) are provided
3. Validates email format using validateEmail function
4. Validates password strength using validatePassword function
5. If validation passes, calls next() to continue
6. If validation fails, returns appropriate error response

**Success Behavior**:
- Continues to the next middleware/route handler

**Error Responses**:
- 400: Email, name, and password are required
- 400: Invalid email format
- 400: Password must meet strength requirements

## Error Handling

### Common Error Types
- **Missing Field Errors**: Occur when required fields are not provided
- **Format Errors**: Occur when email format is invalid
- **Strength Errors**: Occur when password doesn't meet requirements

### Error Response Format
Error responses follow the format:
```json
{
  "success": false,
  "error": "Error message"
}
```

### Status Codes Used
- 400: Bad Request (validation errors)

## Security Considerations

### Current Security Measures
- Validates email format to prevent injection attacks
- Enforces strong password requirements
- Validates required fields to prevent incomplete data

### Security Features
- **Input Sanitization**: Validates input formats before processing
- **Password Security**: Enforces strong password requirements
- **Data Integrity**: Ensures required fields are present

## Usage Examples

### Using with User Creation
```javascript
import { validateUserCreation } from '../middleware/validation.middleware';

// Apply to user creation route
app.post('/api/v1/users', validateUserCreation, async (req, res) => {
  // Validation has already passed
  const { email, name, password } = req.body;
  // Continue with user creation logic
});
```

### Using with Registration
```javascript
import { validateUserCreation } from '../middleware/validation.middleware';

// Apply to registration route
app.post('/api/v1/auth/register', validateUserCreation, async (req, res) => {
  // Validation has already passed
  const { email, name, password } = req.body;
  // Continue with registration logic
});
```

### Standalone Validation
```javascript
// Using individual validation functions
const emailValid = validateEmail('user@example.com');
const passwordStrong = validatePassword('SecurePass123!');
const requiredFieldsPresent = validateRequiredFields(req.body, ['email', 'name', 'password']).length === 0;

if (!emailValid || !passwordStrong || !requiredFieldsPresent) {
  return res.status(400).json({ success: false, error: 'Validation failed' });
}
```

## Integration Points

### With Routes
- Applied to user creation and registration routes
- Used as middleware in route definitions
- Integrated with authentication and user routes

### With Controllers
- Provides validation before controller logic executes
- Prevents invalid data from reaching business logic
- Ensures data integrity before database operations

### With Services
- Ensures validated data reaches service layer
- Reduces validation burden on service functions
- Maintains consistent validation across the application