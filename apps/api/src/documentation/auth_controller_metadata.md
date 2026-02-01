# Authentication Controller Metadata

## Overview
- **File**: `auth.controller.ts`
- **Location**: `src/controllers/auth.controller.ts`
- **Purpose**: Handle user authentication operations (login, registration, profile retrieval)
- **Architecture Layer**: Controller (handles HTTP requests/responses)

## Dependencies
- Express.js (Request, Response objects)
- Prisma Database Client (`@repo/database`)
- JWT Utilities (`../utils/jwt.util`)
- Password Utilities (`../utils/password.util`)
- User Service (`../services/user.service`)

## Key Features
- JWT-based authentication
- User login functionality with password verification
- User registration functionality with password hashing
- Protected route for retrieving user profile
- Input validation and error handling
- Secure password handling with bcrypt

## Exposed Functions
- `loginUser()` - Process user login requests with password verification
- `registerUser()` - Process user registration requests with password hashing
- `getMe()` - Retrieve authenticated user profile

## Security Level
- High - Handles authentication and authorization
- Implements JWT token generation and validation
- Secure password handling with bcrypt hashing
- Password comparison during authentication

## Complexity Level
- Medium - Involves authentication logic, token management, and database operations

## Last Updated
- Date: January 30, 2026
- Version: 1.0.0