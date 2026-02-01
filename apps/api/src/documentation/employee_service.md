# Employee Service Documentation

## Overview

The Employee Service handles all business logic for employee authentication, token management, and account operations. It provides services for registration, login, token refresh, logout, and profile queries.

## Service Functions

### 1. getAllEmployees()

**Description:** Retrieve all employees from the database

**Returns:** `Promise<PrismaEmployee[]>`

**Example:**
```typescript
const employees = await getAllEmployees();
```

**Response:**
```typescript
[
  {
    id: 1,
    email: "emp1@example.com",
    name: "Employee One",
    password: "hashed_password",
    status: "ACTIVE",
    createdAt: Date,
    updatedAt: Date
  },
  ...
]
```

---

### 2. createEmployee(data)

**Description:** Create a new employee with hashed password

**Parameters:**
```typescript
{
  email: string;
  name: string;
  password: string; // Will be hashed
}
```

**Returns:** `Promise<PrismaEmployee>`

**Example:**
```typescript
const employee = await createEmployee({
  email: "newemp@example.com",
  name: "New Employee",
  password: "plainPassword123"
});
```

**Error Cases:**
- Duplicate email (handled by database constraint)
- Database error

---

### 3. getEmployeeById(id)

**Description:** Get employee by ID

**Parameters:**
- `id: number | string` - Employee ID

**Returns:** `Promise<PrismaEmployee | null>`

**Example:**
```typescript
const employee = await getEmployeeById(1);
// or with string
const employee = await getEmployeeById("1");
```

**Response:**
```typescript
{
  id: 1,
  email: "emp@example.com",
  name: "Employee",
  password: "hashed_password",
  status: "ACTIVE",
  createdAt: Date,
  updatedAt: Date
}
// or null if not found
```

---

### 4. getEmployeeByEmail(email)

**Description:** Get employee by email address

**Parameters:**
- `email: string` - Employee email

**Returns:** `Promise<PrismaEmployee | null>`

**Example:**
```typescript
const employee = await getEmployeeByEmail("emp@example.com");
```

---

### 5. updateEmployee(id, data)

**Description:** Update employee information (password will be hashed if provided)

**Parameters:**
- `id: number | string` - Employee ID
- `data: Partial<EmployeeInput>` - Data to update

**Returns:** `Promise<PrismaEmployee>`

**Example:**
```typescript
const updated = await updateEmployee(1, {
  name: "Updated Name",
  password: "newPassword123"
});
```

**Features:**
- Automatically hashes password if provided
- Can update email, name, or password

---

### 6. deleteEmployee(id)

**Description:** Delete an employee

**Parameters:**
- `id: number | string` - Employee ID

**Returns:** `Promise<PrismaEmployee>`

**Example:**
```typescript
const deleted = await deleteEmployee(1);
```

---

### 7. loginEmployee(email, password)

**Description:** Authenticate employee and generate tokens. Revokes all previous sessions.

**Parameters:**
- `email: string` - Employee email
- `password: string` - Plain password

**Returns:** `Promise<LoginResponse>`

**Response:**
```typescript
{
  employee: {
    id: number,
    email: string,
    name: string
  },
  accessToken: string,      // 15 min expiration
  refreshToken: string      // 7 days expiration
}
```

**Error Cases:**
```typescript
// Employee not found
throw new AuthenticationError("Invalid email or password");

// Account disabled
throw new AuthenticationError("Employee account is disabled");

// Wrong password
throw new AuthenticationError("Invalid email or password");
```

**Features:**
- ✅ Validates employee exists and is ACTIVE
- ✅ Compares provided password with hashed password
- ✅ Revokes all previous refresh tokens (single-session enforcement)
- ✅ Generates and stores new refresh token
- ✅ Returns both access and refresh tokens

**Implementation:**
```typescript
export const loginEmployee = async (email: string, password: string) => {
  // 1. Find employee by email
  const employee = await getEmployeeByEmail(email);
  if (!employee) {
    throw new AuthenticationError("Invalid email or password");
  }

  // 2. Check if employee is active
  if (employee.status !== "ACTIVE") {
    throw new AuthenticationError("Employee account is disabled");
  }

  // 3. Verify password
  const isPasswordValid = await comparePassword(password, employee.password);
  if (!isPasswordValid) {
    throw new AuthenticationError("Invalid email or password");
  }

  // 4. Revoke all existing sessions
  await revokeAllRefreshTokens(employee.id.toString());

  // 5. Generate tokens
  const accessToken = generateAccessToken({
    id: employee.id.toString(),
    email: employee.email,
    type: "access"
  });
  const refreshToken = generateRefreshToken({
    id: employee.id.toString(),
    email: employee.email,
    type: "refresh"
  });

  // 6. Store refresh token in database
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      employeeId: employee.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  });

  return { employee, accessToken, refreshToken };
};
```

---

### 8. refreshAccessToken(refreshToken)

**Description:** Generate new access token using refresh token

**Parameters:**
- `refreshToken: string` - Valid refresh token

**Returns:** `Promise<RefreshTokenResponse>`

**Response:**
```typescript
{
  employee: {
    id: number,
    email: string,
    name: string
  },
  accessToken: string  // New access token
}
```

**Validations:**
- Token must be valid JWT
- Token must be of type "refresh"
- Employee ID must be valid
- Refresh token must exist in database
- Refresh token must not be revoked
- Refresh token must not be expired
- Employee must still be ACTIVE

**Error Cases:**
```typescript
throw new AuthenticationError("Invalid or expired refresh token");
throw new AuthenticationError("Employee account is disabled");
```

**Implementation:**
```typescript
export const refreshAccessToken = async (refreshToken: string) => {
  // 1. Verify token signature
  const decoded = verifyToken(refreshToken, "refresh");
  if (!decoded) {
    throw new AuthenticationError("Invalid or expired refresh token");
  }

  // 2. Get employee ID from token
  const employeeId = parseInt(decoded.id);

  // 3. Find refresh token in database
  const storedToken = await prisma.refreshToken.findFirst({
    where: {
      token: refreshToken,
      employeeId,
      revokedAt: null,
      expiresAt: { gt: new Date() }
    },
    include: { employee: true }
  });

  if (!storedToken) {
    throw new AuthenticationError("Invalid or expired refresh token");
  }

  // 4. Check employee is still active
  if (storedToken.employee.status !== "ACTIVE") {
    throw new AuthenticationError("Employee account is disabled");
  }

  // 5. Generate new access token
  const newAccessToken = generateAccessToken({
    id: storedToken.employee.id.toString(),
    email: storedToken.employee.email,
    type: "access"
  });

  return {
    employee: {
      id: storedToken.employee.id,
      email: storedToken.employee.email,
      name: storedToken.employee.name
    },
    accessToken: newAccessToken
  };
};
```

---

### 9. logoutEmployee(refreshToken)

**Description:** Revoke refresh token and log out employee

**Parameters:**
- `refreshToken: string` - Refresh token to revoke

**Returns:** `Promise<boolean>` - true if logout successful, false otherwise

**Example:**
```typescript
const success = await logoutEmployee(refreshToken);
if (success) {
  console.log("Employee logged out");
} else {
  throw new AuthenticationError("Failed to logout");
}
```

**Implementation:**
```typescript
export const logoutEmployee = async (refreshToken: string) => {
  const result = await prisma.refreshToken.updateMany({
    where: {
      token: refreshToken,
      revokedAt: null
    },
    data: {
      revokedAt: new Date()
    }
  });

  return result.count > 0;
};
```

---

### 10. revokeAllRefreshTokens(employeeId)

**Description:** Revoke all refresh tokens for an employee (used for single-session enforcement)

**Parameters:**
- `employeeId: number | string` - Employee ID

**Returns:** `Promise<void>`

**Example:**
```typescript
await revokeAllRefreshTokens("1");
```

**Used by:** `loginEmployee()` to enforce single session

---

### 11. canEmployeeLogin(employeeId)

**Description:** Check if employee can login (no active sessions)

**Parameters:**
- `employeeId: number | string` - Employee ID

**Returns:** `Promise<boolean>` - true if no active sessions, false otherwise

**Example:**
```typescript
const canLogin = await canEmployeeLogin("1");
if (!canLogin) {
  throw new AuthenticationError("Already logged in from another device");
}
```

**Logic:**
- Counts active, non-revoked refresh tokens
- Counts only tokens that haven't expired
- Returns true if count is 0 (can login)
- Returns false if count > 0 (already logged in)

---

## Error Handling

All services use custom error classes:

```typescript
// Validation error
throw new ValidationError("Invalid employee ID");

// Authentication error
throw new AuthenticationError("Invalid credentials");

// Server error
throw new ServerError("Database error");
```

## Database Schema

```prisma
model Employee {
  id              Int      @id @default(autoincrement())
  email           String   @unique
  name            String
  password        String
  status          String   @default("ACTIVE")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  refreshTokens   RefreshToken[]
}

model RefreshToken {
  id              Int      @id @default(autoincrement())
  token           String   @unique
  employee        Employee @relation(fields: [employeeId], references: [id])
  employeeId      Int
  expiresAt       DateTime
  revokedAt       DateTime?
  createdAt       DateTime @default(now())
}
```

## Single-Session Enforcement

The service implements single-session login:

1. When employee logs in:
   - All previous refresh tokens are revoked
   - New refresh token is generated and stored
   - Only this new token can be used for session

2. When trying to login while already logged in:
   - Service checks for active refresh tokens
   - If found, returns error before attempting login
   - Prevents creating another session

3. When employee logs out:
   - Refresh token is marked as revoked
   - Cannot generate new access tokens anymore

---

## Best Practices

### 1. Always Pass Errors to Controller
```typescript
try {
  const employee = await loginEmployee(email, password);
} catch (error) {
  // Handle in controller
}
```

### 2. Use Appropriate Error Messages
```typescript
// ✅ Good - Don't reveal if user exists
throw new AuthenticationError("Invalid email or password");

// ❌ Bad - Reveals user existence
throw new AuthenticationError("User with this email not found");
```

### 3. Validate Input in Controller
```typescript
// Do validation in controller
if (!email) {
  throw new ValidationError("Email is required");
}
// Then call service
const employee = await loginEmployee(email, password);
```

### 4. Handle Token Expiration
```typescript
// Check token expiration timestamps
if (storedToken.expiresAt < new Date()) {
  throw new AuthenticationError("Token expired");
}
```

---

## Related Documentation

- [Error Handling System](./error_handling_system.md)
- [Employee Routes Details](./employee_routes_details.md)
- [JWT Utilities](./jwt_util_details.md)
- [Password Utilities](./password_util_details.md)
