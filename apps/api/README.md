# CRM API Backend

This is the backend API for the CRM application, built with Node.js, Express, and TypeScript.

## Folder Structure

```
src/
├── controllers/      # Request handlers
│   ├── user.controller.ts
│   └── auth.controller.ts
├── models/          # Database models (using Prisma)
├── routes/          # Route definitions
│   ├── user.route.ts
│   └── auth.route.ts
├── middleware/      # Custom middleware
│   ├── auth.middleware.ts
│   ├── error.middleware.ts
│   └── validation.middleware.ts
├── services/        # Business logic
│   └── user.service.ts
├── utils/           # Utility functions
│   ├── jwt.util.ts
│   └── email.util.ts
├── config/          # Configuration files
│   └── env.config.ts
├── database/        # Database connection/utils
│   └── db.ts
├── validations/     # Validation schemas
├── interfaces/      # TypeScript interfaces
│   └── user.interface.ts
├── enums/           # TypeScript enums
├── app.ts           # Main Express app
└── index.ts         # Server entry point
```

## Features

- **Authentication**: JWT-based authentication with login, register, and profile endpoints
- **User Management**: CRUD operations for users
- **Email Service**: Text and document email sending capabilities
- **Validation**: Input validation middleware
- **Error Handling**: Centralized error handling middleware

## Available Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `GET /api/v1/auth/me` - Get current user (requires auth)

### Users
- `GET /api/v1/users` - Get all users
- `POST /api/v1/users` - Create a new user

### General
- `GET /health` - Health check endpoint

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
PORT=3001
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRATION=7d
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM="Your Name" <your_email@gmail.com>
NODE_ENV=development
```

## Running the Application

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm dev

# Build for production
pnpm build

# Run in production
pnpm start
```