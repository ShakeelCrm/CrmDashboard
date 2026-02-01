# User Service Documentation

## Overview
The User Service module provides business logic for managing user data in the CRM API. It acts as an abstraction layer between the controllers and the database, handling all user-related operations with proper security measures including password hashing.

## Table of Contents
1. [Overview](#overview)
2. [Imports and Dependencies](#imports-and-dependencies)
3. [Interface Definitions](#interface-definitions)
4. [Type Definitions](#type-definitions)
5. [Function Details](#function-details)
6. [Security Features](#security-features)
7. [Usage Examples](#usage-examples)
8. [Integration Points](#integration-points)

## Imports and Dependencies

### External Dependencies
- `@repo/database`: Workspace package containing Prisma database client

### Internal Dependencies
- `../utils/password.util`: Utility functions for password hashing

### Purpose of Each Import
- `prisma` from `@repo/database`: Database client for performing user operations
- `hashPassword` from `../utils/password.util`: Function to securely hash passwords

## Interface Definitions

### UserInput
```typescript
interface UserInput {
  email: string;
  name: string;
  password: string;
}
```
Defines the input structure for user creation and updates, including email, name, and password.

## Type Definitions

### PrismaUser
```typescript
type PrismaUser = {
  id: string; // Assuming Prisma uses string IDs
  email: string;
  name: string | null;
  password: string; // Hashed password
  createdAt: Date;
  updatedAt: Date;
};
```
Defines the structure of user objects returned by Prisma, including all required fields with proper typing.

## Function Details

### getAllUsers()
**Description**: Retrieves all users from the database.

**Return Type**: `Promise<PrismaUser[]>`

**Process Flow**:
1. Calls Prisma's `user.findMany()` method to retrieve all users
2. Returns the array of users

**Usage**:
```typescript
const users = await getAllUsers();
```

### createUser({ email, name, password })
**Description**: Creates a new user with a hashed password.

**Parameters**:
- `{ email, name, password }` (UserInput): Object containing user details

**Return Type**: `Promise<PrismaUser>`

**Process Flow**:
1. Hashes the provided password using bcrypt
2. Creates a new user record in the database with the hashed password
3. Returns the created user object

**Usage**:
```typescript
const newUser = await createUser({ 
  email: 'user@example.com', 
  name: 'John Doe', 
  password: 'securePassword123' 
});
```

### getUserById(id)
**Description**: Retrieves a user by their unique ID.

**Parameters**:
- `id` (string): The unique identifier of the user

**Return Type**: `Promise<PrismaUser | null>`

**Process Flow**:
1. Calls Prisma's `user.findUnique()` method with the provided ID
2. Returns the user if found, null otherwise

**Usage**:
```typescript
const user = await getUserById('user_id_string');
```

### getUserByEmail(email)
**Description**: Retrieves a user by their email address.

**Parameters**:
- `email` (string): The email address of the user

**Return Type**: `Promise<PrismaUser | null>`

**Process Flow**:
1. Calls Prisma's `user.findUnique()` method with the provided email
2. Returns the user if found, null otherwise

**Usage**:
```typescript
const user = await getUserByEmail('user@example.com');
```

### updateUser(id, data)
**Description**: Updates an existing user's information.

**Parameters**:
- `id` (string): The unique identifier of the user to update
- `data` (Partial<UserInput>): Object containing fields to update

**Return Type**: `Promise<PrismaUser>`

**Process Flow**:
1. Checks if a password is included in the update data
2. If password is provided, hashes it using bcrypt
3. Updates the user record in the database
4. Returns the updated user object

**Usage**:
```typescript
const updatedUser = await updateUser('user_id_string', {
  name: 'Updated Name',
  password: 'newSecurePassword123' // Will be hashed automatically
});
```

### deleteUser(id)
**Description**: Removes a user from the database.

**Parameters**:
- `id` (string): The unique identifier of the user to delete

**Return Type**: `Promise<PrismaUser>`

**Process Flow**:
1. Calls Prisma's `user.delete()` method with the provided ID
2. Returns the deleted user object

**Usage**:
```typescript
const deletedUser = await deleteUser('user_id_string');
```

## Security Features

### Password Hashing
- All passwords are automatically hashed using bcrypt before storage
- Salt rounds set to 10 for optimal security/performance balance
- Hashing occurs at the service layer to ensure consistent security

### Data Protection
- Passwords are stored as hashed values, never in plain text
- User objects returned by service functions include all necessary fields while maintaining security

## Usage Examples

### Creating a New User
```typescript
import { createUser } from '../services/user.service';

try {
  const newUser = await createUser({
    email: 'newuser@example.com',
    name: 'New User',
    password: 'SecurePass123!'
  });
  console.log('User created successfully:', newUser.id);
} catch (error) {
  console.error('Error creating user:', error);
}
```

### Authenticating a User
```typescript
import { getUserByEmail } from '../services/user.service';
import { comparePassword } from '../utils/password.util';

async function authenticateUser(email: string, password: string) {
  const user = await getUserByEmail(email);
  
  if (!user) {
    return { success: false, error: 'User not found' };
  }
  
  const isValid = await comparePassword(password, user.password);
  
  if (!isValid) {
    return { success: false, error: 'Invalid credentials' };
  }
  
  return { success: true, user };
}
```

### Updating User Information
```typescript
import { updateUser } from '../services/user.service';

try {
  // Update user name only
  const updatedUser = await updateUser('user_id_string', {
    name: 'Updated Name'
  });
  
  // Update password (will be hashed automatically)
  const userWithNewPassword = await updateUser('user_id_string', {
    password: 'NewSecurePassword123!'
  });
} catch (error) {
  console.error('Error updating user:', error);
}
```

## Integration Points

### With Database
- Uses Prisma client through `@repo/database` package
- Interacts with User model in the database
- Performs all CRUD operations on User records

### With Controllers
- Called by authentication and user controllers for business logic
- Provides data access methods with security measures applied

### With Utilities
- Integrates with password utilities for secure password handling
- Ensures consistent password hashing across the application