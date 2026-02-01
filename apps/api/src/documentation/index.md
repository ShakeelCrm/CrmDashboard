# CRM API Backend Documentation

Welcome to the comprehensive documentation for the CRM API Backend. This documentation covers all the implemented functionality including authentication, user management, employee management, error handling, and more.

## 🚀 Quick Start

- **[API Routes Overview](./api_routes_overview.md)** - Complete guide to all API endpoints
- **[Getting Started](./getting_started.md)** - Setup and basic usage
- **[Error Handling System](./error_handling_system.md)** - Comprehensive error handling documentation

## 📋 Table of Contents

### API Routes & Endpoints
- **[API Routes Overview](./api_routes_overview.md)** - Complete routes structure and testing guide
- [Auth Routes Details](./auth_routes_details.md) - User authentication endpoints
- [Employee Routes Details](./employee_routes_details.md) - Employee authentication with single-session enforcement
- [User Routes Details](./user_routes_details.md) - User management endpoints

### Controllers
- [Auth Controller Enhanced](./auth_controller_enhanced.md) - User authentication controller with error handling
- [User Controller Details](./user_controller_details.md) - User CRUD operations
- [Employee Authentication System](./employee_auth_system.md) - Employee auth with token management

### Core Components
- **[Error Handling System](./error_handling_system.md)** - Industry-standard error handling with custom error classes
- [Authentication Middleware](./auth_middleware_details.md) - JWT-based authentication
- [Validation Middleware](./validation_middleware_details.md) - Input validation
- [Error Middleware Details](./error_middleware_details.md) - Centralized error handler

### Services
- [User Service Details](./user_service_details.md) - Business logic for user operations
- [Employee Service](./employee_service.md) - Business logic for employee operations

### Utility Modules
- [JWT Utilities](./jwt_util_details.md) - Token generation and verification
- [Password Utilities](./password_util_details.md) - Password hashing and comparison
- [Email Utilities](./email_util_details.md) - Email sending functionality
- [Configuration](./config_details.md) - Environment configuration

## Architecture Overview

The CRM API follows a modular, scalable architecture with clear separation of concerns:

```
src/
├── controllers/        # Request handlers with error handling
├── routes/             # Route definitions
├── middleware/         # Custom middleware (auth, validation, errors)
├── services/           # Business logic layer
├── utils/              # Utility functions & error classes
│   ├── error.util.ts   # Custom error classes (NEW)
│   ├── jwt.util.ts     # Token generation/verification
│   ├── password.util.ts# Password hashing
│   └── email.util.ts   # Email sending
├── config/             # Configuration files
├── database/           # Database connection/utils
├── validations/        # Validation schemas
├── interfaces/         # TypeScript interfaces
├── enums/              # TypeScript enums
├── types/              # Type declarations
├── documentation/      # Documentation files
├── app.ts              # Express app configuration
└── index.ts            # Server entry point
```

## Key Features

### ✅ Error Handling
- Custom error classes for different error types
- Centralized error middleware for consistent responses
- Proper HTTP status codes
- Detailed logging with timestamps

### ✅ Authentication
- JWT-based token authentication
- Access tokens (15 min expiration)
- Refresh tokens (7 days expiration)
- Single-session enforcement for employees
- Password hashing with bcrypt

### ✅ Validation
- Email format validation
- Password strength requirements
- Name length validation
- Duplicate email prevention

### ✅ Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Secure password comparison
- Rate limiting considerations
- Single-session limitation for enhanced security
- Access and refresh token management

## Getting Started

For setup instructions and environment configuration, please refer to the main README.md file in the project root.