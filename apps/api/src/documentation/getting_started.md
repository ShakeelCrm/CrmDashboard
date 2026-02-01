# Getting Started Guide

## Prerequisites

- Node.js 18+ 
- pnpm (or npm)
- Database (Prisma configured)
- Environment variables configured

## Installation

### 1. Install Dependencies

```bash
cd apps/api
pnpm install
```

### 2. Configure Environment

Create `.env` file in `apps/api`:

```env
# Server
PORT=4000
NODE_ENV=development

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Database
DATABASE_URL=your_database_url

# Email (if using email features)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASSWORD=your_password
```

### 3. Setup Database

```bash
# Push schema to database
pnpm prisma db push

# Generate Prisma client
pnpm prisma generate
```

### 4. Start Development Server

```bash
pnpm dev
```

Server will start on `http://localhost:4000`

## Verify Installation

### 1. Health Check

```bash
curl http://localhost:4000/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2026-01-31T10:30:45.123Z"
}
```

### 2. Test User Registration

```bash
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "TestPass123"
  }'
```

Expected response (201 Created):
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "test@example.com",
    "name": "Test User"
  }
}
```

### 3. Test Employee Registration

```bash
curl -X POST http://localhost:4000/api/v1/employees/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "emp@example.com",
    "name": "Employee User",
    "password": "EmpPass123"
  }'
```

Expected response (201 Created):
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "employee": {
    "id": 1,
    "email": "emp@example.com",
    "name": "Employee User"
  }
}
```

## Common Tasks

### Add a New Endpoint

1. Create controller function in `controllers/`
2. Add route in `routes/`
3. Use proper error handling:

```typescript
export const myController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validation
    if (!req.body.email) {
      throw new ValidationError("Email is required");
    }

    // Business logic
    const result = await myService();

    // Response
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
```

### Handle Different Error Types

```typescript
// Validation error
throw new ValidationError("Email format is invalid");

// Authentication error
throw new AuthenticationError("Invalid credentials");

// Conflict error
throw new ConflictError("User already exists");

// Not found error
throw new NotFoundError("User not found");

// Server error
throw new ServerError("Database connection failed");
```

### Create a New Service

```typescript
// services/myservice.ts
export const myService = async (data: MyData) => {
  try {
    // Business logic
    const result = await prisma.model.create({ data });
    return result;
  } catch (error) {
    throw new ServerError("Failed to create record");
  }
};
```

## API Testing with Postman

### 1. Import API Collection

Create a new Postman collection with these endpoints:

### 2. User Authentication Flow

**Step 1: Register**
- POST: `{{baseUrl}}/api/v1/auth/register`
- Body:
```json
{
  "email": "user@example.com",
  "name": "User Name",
  "password": "Password123"
}
```

**Step 2: Login**
- POST: `{{baseUrl}}/api/v1/auth/login`
- Body:
```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

**Step 3: Get Profile**
- GET: `{{baseUrl}}/api/v1/auth/me`
- Header: `Authorization: Bearer {{token}}`

### 3. Employee Authentication Flow

**Step 1: Register**
- POST: `{{baseUrl}}/api/v1/employees/register`
- Body:
```json
{
  "email": "emp@example.com",
  "name": "Employee Name",
  "password": "EmpPass123"
}
```

**Step 2: Login**
- POST: `{{baseUrl}}/api/v1/employees/login`
- Body:
```json
{
  "email": "emp@example.com",
  "password": "EmpPass123"
}
```

**Step 3: Refresh Token (when access expires)**
- POST: `{{baseUrl}}/api/v1/employees/refresh-token`
- Body:
```json
{
  "refreshToken": "{{refreshToken}}"
}
```

**Step 4: Get Profile**
- GET: `{{baseUrl}}/api/v1/employees/me`
- Header: `Authorization: Bearer {{accessToken}}`

**Step 5: Logout**
- POST: `{{baseUrl}}/api/v1/employees/logout`
- Body:
```json
{
  "refreshToken": "{{refreshToken}}"
}
```

## Development Tips

### 1. Check Logs
Watch the terminal where you ran `pnpm dev` for error logs and request details.

### 2. Database Queries
Use Prisma Studio to view database:
```bash
pnpm prisma studio
```

### 3. TypeScript Compilation
Check for TypeScript errors:
```bash
pnpm build
```

### 4. Test Error Handling
Try invalid requests to test error handling:

```bash
# Missing fields
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Invalid email
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "name": "Test",
    "password": "Pass123"
  }'

# Duplicate user
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test",
    "password": "Pass123"
  }'
```

## Troubleshooting

### Issue: Port 4000 already in use
```bash
# Change port in .env
PORT=4001
```

### Issue: Database connection failed
```bash
# Check DATABASE_URL in .env
# Verify database is running
# Check Prisma schema matches database
pnpm prisma db push
```

### Issue: JWT token errors
```bash
# Verify JWT_SECRET is set in .env
# Check token expiration times
# Ensure Bearer token format: "Bearer <token>"
```

### Issue: CORS errors
```bash
# CORS is enabled for all origins in app.ts
# Check request headers include Content-Type
```

## Next Steps

1. **Read API Routes Overview** - [api_routes_overview.md](./api_routes_overview.md)
2. **Understand Error Handling** - [error_handling_system.md](./error_handling_system.md)
3. **Explore Employee Routes** - [employee_routes_details.md](./employee_routes_details.md)
4. **Learn Authentication** - [auth_middleware_details.md](./auth_middleware_details.md)

## Useful Resources

- [Express.js Documentation](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [JWT Introduction](https://jwt.io/introduction)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
