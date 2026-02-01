# Password Utilities Documentation

## Overview
The Password Utilities module provides secure password hashing and verification functions for the CRM API. It uses bcrypt to ensure passwords are stored securely and compared safely.

## Table of Contents
1. [Overview](#overview)
2. [Imports and Dependencies](#imports-and-dependencies)
3. [Constants](#constants)
4. [Function Details](#function-details)
5. [Security Considerations](#security-considerations)
6. [Usage Examples](#usage-examples)
7. [Integration Points](#integration-points)

## Imports and Dependencies

### External Dependencies
- `bcrypt`: Library for secure password hashing using adaptive hashing algorithm

### Internal Dependencies
- None

### Purpose of Each Import
- `bcrypt`: Provides secure password hashing and comparison functions

## Constants

### SALT_ROUNDS
```typescript
const SALT_ROUNDS = 10;
```
Defines the number of salt rounds to use when hashing passwords. Higher values increase security but also computation time. 10 is considered a good balance between security and performance.

## Function Details

### hashPassword(password)
**Description**: Creates a hashed version of a plaintext password using bcrypt.

**Parameters**:
- `password` (string): The plaintext password to hash

**Return Type**: `Promise<string>`

**Process Flow**:
1. Uses bcrypt to generate a salt with the configured number of rounds
2. Combines the salt with the password and creates a hash
3. Returns the hashed password as a string

**Usage**:
```typescript
const hashedPassword = await hashPassword('plaintextPassword123');
// Returns a bcrypt hash string like '$2b$10$...'
```

### comparePassword(password, hash)
**Description**: Compares a plaintext password with a stored hash to verify correctness.

**Parameters**:
- `password` (string): The plaintext password to verify
- `hash` (string): The stored hash to compare against

**Return Type**: `Promise<boolean>`

**Process Flow**:
1. Uses bcrypt to compare the plaintext password with the stored hash
2. Returns true if they match, false otherwise
3. Handles the cryptographic comparison securely

**Usage**:
```typescript
const isValid = await comparePassword('plaintextPassword123', storedHash);
// Returns true if password matches the hash, false otherwise
```

## Security Considerations

### Current Security Measures
- Uses bcrypt's adaptive hashing algorithm for password storage
- Employs salt generation to prevent rainbow table attacks
- Secure comparison function that prevents timing attacks
- Configurable salt rounds for balancing security and performance

### Security Features
- **Adaptive Hashing**: bcrypt adjusts to increasing computational power
- **Salt Generation**: Each password gets a unique salt to prevent rainbow table attacks
- **Timing Attack Prevention**: Secure comparison that takes consistent time
- **One-way Hashing**: Passwords cannot be reversed from their hashes

### Best Practices Followed
- Never store plaintext passwords
- Use appropriate salt rounds (10 is standard)
- Hash passwords before storing in database
- Use secure comparison for verification
- Regularly review and update security parameters

## Usage Examples

### Hashing Passwords During Registration
```javascript
import { hashPassword } from '../utils/password.util';

// In user service during registration
const createUser = async ({ email, name, password }) => {
  const hashedPassword = await hashPassword(password);
  
  return await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword  // Store the hash, not the plaintext
    }
  });
};
```

### Verifying Passwords During Login
```javascript
import { comparePassword } from '../utils/password.util';

// In authentication controller during login
const authenticateUser = async (email, password) => {
  const user = await getUserByEmail(email);
  
  if (!user) {
    return { success: false, error: 'Invalid credentials' };
  }
  
  const isValid = await comparePassword(password, user.password);
  
  if (!isValid) {
    return { success: false, error: 'Invalid credentials' };
  }
  
  // Password is valid, proceed with authentication
  return { success: true, user };
};
```

### Updating User Password
```javascript
import { hashPassword } from '../utils/password.util';

// In user service for password updates
const updateUserPassword = async (userId, newPassword) => {
  const hashedPassword = await hashPassword(newPassword);
  
  return await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword }
  });
};
```

### Batch Password Operations
```javascript
// Hashing multiple passwords
const passwords = ['pass1', 'pass2', 'pass3'];
const hashedPasswords = await Promise.all(
  passwords.map(pwd => hashPassword(pwd))
);
```

## Integration Points

### With User Service
- Used to hash passwords before storing in database
- Provides secure password comparison during authentication
- Ensures consistent password handling across the application

### With Authentication System
- Verifies passwords during login process
- Hashes passwords during registration
- Supports password reset functionality

### With Controllers
- Enables secure password handling in user and auth controllers
- Provides utilities for password validation workflows
- Supports password change operations