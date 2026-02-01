# Error Middleware Documentation

## Overview
The Error Middleware provides centralized error handling for the CRM API. It catches errors from other middleware and route handlers, formats them consistently, and sends appropriate responses to clients.

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
- `express`: Web framework providing Request, Response, NextFunction types

### Internal Dependencies
- None

### Purpose of Each Import
- `Request, Response, NextFunction` from express: For type safety in middleware functions

## Function Details

### errorHandler(err, req, res, next)
**Description**: Centralized error handler that formats errors consistently and sends appropriate responses.

**Parameters**:
- `err` (any): The error object that was passed to the middleware
- `req` (Request): Express request object
- `res` (Response): Express response object for sending back error responses
- `next` (NextFunction): Express next function

**Process Flow**:
1. Logs the error stack trace to the console for debugging
2. Sets the response status to the error's status code or defaults to 500
3. Sends a JSON response with success: false and error message
4. Uses the error's message property or defaults to "Server Error"

**Success Behavior**:
- Formats error responses consistently
- Logs errors for debugging purposes
- Sends appropriate HTTP status codes

## Error Handling

### Common Error Types Handled
- **Application Errors**: Errors thrown by application code
- **Validation Errors**: Errors from validation middleware
- **Database Errors**: Errors from database operations
- **Authentication Errors**: Errors from authentication processes
- **System Errors**: Unexpected runtime errors

### Error Response Format
All error responses follow the format:
```json
{
  "success": false,
  "error": "Error message"
}
```

### Status Codes Used
- 500: Internal Server Error (default for unhandled errors)
- Specific status codes from error objects (if available)

## Security Considerations

### Current Security Measures
- Prevents sensitive error details from being exposed to clients
- Standardizes error responses to avoid information leakage
- Logs full error details for debugging while sending minimal info to clients

### Security Features
- **Information Hiding**: Prevents stack traces and internal details from client exposure
- **Consistent Responses**: Ensures all errors follow the same format
- **Debugging Support**: Logs full errors internally while keeping responses minimal

## Usage Examples

### Setting Up Global Error Handler
```javascript
import { errorHandler } from '../middleware/error.middleware';

// After defining all routes, add the error handler
app.use(errorHandler);

// Example route that throws an error
app.get('/error-test', (req, res, next) => {
  // Simulate an error
  const error = new Error('Test error');
  error.statusCode = 400;
  next(error); // Pass error to error handler
});
```

### Using with Async Operations
```javascript
// In a controller function
export const getData = async (req, res, next) => {
  try {
    // Some operation that might fail
    const data = await someAsyncOperation();
    res.json({ success: true, data });
  } catch (error) {
    // Pass error to global error handler
    next(error);
  }
};
```

### Creating Custom Errors
```javascript
// In a service function
export const validateUser = (userData) => {
  if (!userData.email) {
    const error = new Error('Email is required');
    error.statusCode = 400;
    throw error; // Will be caught by error handler
  }
  return true;
};
```

## Integration Points

### With Application Setup
- Applied globally after all routes in app.ts
- Catches errors from any middleware or route handler
- Provides centralized error handling

### With Controllers
- Receives errors passed via next() function
- Handles errors from async operations
- Provides consistent error responses

### With Services
- Catches errors thrown by service functions
- Formats service-level errors consistently
- Maintains error context for debugging