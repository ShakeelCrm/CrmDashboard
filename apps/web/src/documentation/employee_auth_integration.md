# Employee Authentication Integration

## Overview

This document outlines the integration of employee authentication into the Next.js web application. The implementation uses Next.js API routes as a proxy to communicate with the backend API, providing employee login, signup, and token management functionality.

## Architecture

### Frontend Components
- **Login Page** (`/src/app/(auth)/login/page.tsx`): Employee login form
- **Signup Page** (`/src/app/(auth)/signup/page.tsx`): Employee registration form
- **Dashboard Page** (`/src/app/(dashboard)/page.tsx`): Protected employee dashboard
- **Protected Layout** (`/src/app/(dashboard)/layout.tsx`): Authentication guard for protected routes
- **Header Component** (`/src/components/header.tsx`): User info and logout functionality

### API Routes (Proxy)
- **Login Proxy** (`/src/app/api/auth/login/route.ts`): Forwards login requests to backend
- **Signup Proxy** (`/src/app/api/auth/signup/route.ts`): Forwards signup requests to backend
- **Refresh Token Proxy** (`/src/app/api/auth/refresh/route.ts`): Handles token refresh
- **Logout Proxy** (`/src/app/api/auth/logout/route.ts`): Handles logout requests

### Authentication Services
- **Auth Context** (`/src/lib/auth-context.tsx`): Manages authentication state throughout the app
- **Auth Service** (`/src/lib/auth-service.ts`): Handles authentication operations
- **NextAuth Configuration** (`/src/auth.ts`): Configures NextAuth with employee endpoints

## API Endpoints Used

### Employee Authentication
- `POST /employees/login` - Authenticate employee
- `POST /employees/register` - Register new employee
- `POST /employees/refresh-token` - Refresh access token
- `POST /employees/logout` - Logout employee

## Token Management

### Access Tokens
- Short-lived tokens (15 minutes by default)
- Stored in NextAuth session
- Used for API requests to protected resources

### Refresh Tokens
- Longer-lived tokens (7 days by default)
- Stored in localStorage (should be moved to httpOnly cookies in production)
- Used to refresh access tokens when they expire

## Security Features

### Single-Session Limitation
- Employees can only be logged in from one device/session at a time
- Previous sessions are automatically terminated when a new login occurs
- Enhances security by preventing concurrent access

### Secure Communication
- All authentication requests are proxied through Next.js API routes
- Sensitive tokens are not exposed to the browser unnecessarily
- HTTPS recommended in production

## Implementation Details

### NextAuth Configuration
The NextAuth configuration has been updated to use employee-specific endpoints:
- Login: `/employees/login` instead of `/auth/login`
- Signup: `/employees/register` instead of `/auth/signup`

### State Management
- Authentication state is managed using React Context
- Session information is synchronized with NextAuth
- Automatic token refresh when access tokens expire

### Protected Routes
- The `(dashboard)` route group is protected using a layout wrapper
- Unauthenticated users are redirected to the login page
- Loading states are displayed while authentication is being checked

## Environment Variables

- `NEXT_PUBLIC_API_URL`: The URL of the backend API (defaults to `http://localhost:3001`)

## Error Handling

- Network errors are caught and appropriate messages are displayed
- Authentication failures redirect to the login page
- Token refresh failures trigger logout

## Future Improvements

1. **Secure Token Storage**: Move refresh tokens from localStorage to httpOnly cookies
2. **Automatic Token Refresh**: Implement automatic access token refresh before expiration
3. **Enhanced Security**: Add CSRF protection and additional security headers
4. **Improved UX**: Add loading indicators and better error messaging
5. **Role-Based Access**: Implement role-based access controls for different employee types