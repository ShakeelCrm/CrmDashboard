# Configuration Documentation

## Overview
The Configuration module manages environment-specific settings for the CRM API. It centralizes configuration values like ports, JWT settings, and email configurations from environment variables.

## Table of Contents
1. [Overview](#overview)
2. [Imports and Dependencies](#imports-and-dependencies)
3. [Configuration Properties](#configuration-properties)
4. [Environment Variables](#environment-variables)
5. [Usage Examples](#usage-examples)
6. [Security Considerations](#security-considerations)
7. [Integration Points](#integration-points)

## Imports and Dependencies

### External Dependencies
- None

### Internal Dependencies
- None

### Purpose of Each Import
- No external dependencies required

## Configuration Properties

### config Object
```typescript
export const config = {
  port: parseInt(process.env.PORT || "3001", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  jwtSecret: process.env.JWT_SECRET || "fallback_jwt_secret_for_dev",
  jwtExpiration: process.env.JWT_EXPIRATION || "7d",
  emailFrom: process.env.EMAIL_FROM || '"noreply" <noreply@example.com>',
};
```
Contains all the configuration values for the application.

#### port
- **Type**: number
- **Default**: 3001
- **Description**: The port number the application will listen on
- **Environment Variable**: PORT

#### nodeEnv
- **Type**: string
- **Default**: "development"
- **Description**: The current environment (development, production, test)
- **Environment Variable**: NODE_ENV

#### jwtSecret
- **Type**: string
- **Default**: "fallback_jwt_secret_for_dev"
- **Description**: Secret key used for signing JWT tokens
- **Environment Variable**: JWT_SECRET
- **Security Note**: Should be a strong, random string in production

#### jwtExpiration
- **Type**: string
- **Default**: "7d"
- **Description**: Duration for which JWT tokens remain valid (supports formats like "7d", "24h", "30m")
- **Environment Variable**: JWT_EXPIRATION

#### emailFrom
- **Type**: string
- **Default**: '"noreply" <noreply@example.com>'
- **Description**: Default sender address for outgoing emails
- **Environment Variable**: EMAIL_FROM

## Environment Variables

### Required Variables
- `PORT`: Port number for the server (optional, defaults to 3001)
- `NODE_ENV`: Environment mode (optional, defaults to "development")
- `JWT_SECRET`: Secret for JWT signing (required for production)
- `JWT_EXPIRATION`: Token expiration time (optional, defaults to "7d")
- `EMAIL_FROM`: Default email sender (optional)

### Recommended Production Variables
- `DATABASE_URL`: Database connection string
- `EMAIL_USER`: Email service username
- `EMAIL_PASS`: Email service password/app key
- `JWT_SECRET`: Strong, random secret for JWT signing

## Usage Examples

### Using Configuration in Application
```javascript
import { config } from '../config/env.config';

// Starting the server on configured port
app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});

// Using JWT configuration
const token = jwt.sign(payload, config.jwtSecret, {
  expiresIn: config.jwtExpiration
});

// Using email configuration
const transporter = nodemailer.createTransport({
  // ...transport configuration
  from: config.emailFrom
});
```

### Conditional Logic Based on Environment
```javascript
import { config } from '../config/env.config';

// Different behavior based on environment
if (config.nodeEnv === 'development') {
  console.log('Running in development mode');
  // Enable additional logging
} else if (config.nodeEnv === 'production') {
  console.log('Running in production mode');
  // Enable additional security measures
}
```

### Validating Required Configuration
```javascript
import { config } from '../config/env.config';

const validateConfig = () => {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'fallback_jwt_secret_for_dev') {
    console.warn('WARNING: Using default JWT secret, please set JWT_SECRET environment variable');
  }
  
  if (config.nodeEnv === 'production' && config.jwtSecret === 'fallback_jwt_secret_for_dev') {
    throw new Error('JWT_SECRET must be set in production environment');
  }
};

validateConfig();
```

### Dynamic Configuration Loading
```javascript
// Load different configurations based on environment
const loadConfig = () => {
  switch (config.nodeEnv) {
    case 'production':
      return {
        ...config,
        // Production-specific overrides
        jwtExpiration: process.env.JWT_EXPIRATION || '1d'
      };
    case 'test':
      return {
        ...config,
        port: 3002, // Different port for tests
        jwtExpiration: '1h' // Shorter expiration for tests
      };
    default:
      return config;
  }
};
```

## Security Considerations

### Current Security Measures
- Sensitive information stored in environment variables
- Default fallbacks only for development
- Warnings when using default secrets in production

### Security Features
- **Environment-Based Configuration**: Sensitive data loaded from environment
- **Production Validation**: Checks for proper configuration in production
- **Default Protection**: Fallback values only for development use
- **Separation of Concerns**: Configuration isolated from application logic

### Best Practices Followed
- Never hardcode secrets in source code
- Use strong, random values for JWT secrets in production
- Validate configuration at startup
- Log warnings for missing or weak configuration

## Integration Points

### With Application Startup
- Used to determine server port and environment
- Configures JWT settings for authentication
- Sets up email sender information

### With Authentication System
- Provides JWT secret for token signing
- Sets token expiration times
- Supports different configurations per environment

### With Email System
- Provides default sender address
- Supports environment-specific email settings
- Enables conditional email behavior

### With Database
- Can be extended to include database configuration
- Supports environment-specific database settings
- Enables different database connections per environment