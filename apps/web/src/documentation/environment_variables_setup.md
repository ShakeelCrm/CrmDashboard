# Environment Variables Setup Guide

## Overview

This document explains the environment variables required to run the Next.js web application with the employee authentication system.

## Required Environment Variables

### `NEXT_PUBLIC_API_URL`
- **Type**: Public (available in browser)
- **Purpose**: URL of the backend API server
- **Default**: `http://localhost:3001`
- **Usage**: The Next.js application uses this URL to make API calls to the backend
- **Example**: 
  - Development: `http://localhost:3001`
  - Production: `https://api.yourdomain.com`

### `NEXTAUTH_SECRET`
- **Type**: Private (server-side only)
- **Purpose**: Secret used to encrypt NextAuth.js JWTs
- **Default**: `dev-secret-change-in-production`
- **Security**: Must be a strong, random string in production
- **Generation**: Use `openssl rand -base64 32` to generate a secure secret

### `NEXTAUTH_URL`
- **Type**: Public (but primarily used server-side)
- **Purpose**: Base URL of your application (used for redirects)
- **Default**: `http://localhost:3000`
- **Usage**: NextAuth.js uses this for constructing URLs
- **Example**:
  - Development: `http://localhost:3000`
  - Production: `https://yourdomain.com`

## Setting Up Environment Variables

### 1. Copy the example file:
```bash
cd apps/web
cp .env.example .env.local
```

### 2. Update the values:
Edit `.env.local` and update the values according to your environment.

### 3. For production deployment:
- Set `NEXT_PUBLIC_API_URL` to your production API URL
- Set `NEXTAUTH_URL` to your production web URL
- Generate a strong `NEXTAUTH_SECRET` using `openssl rand -base64 32`
- Never commit `.env.local` to version control

## Development Setup

For local development with the backend running on port 3001:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXTAUTH_SECRET=dev-secret-change-in-production
NEXTAUTH_URL=http://localhost:3000
```

## Production Setup

For production deployment:

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXTAUTH_SECRET=your-very-long-and-random-secret-string
NEXTAUTH_URL=https://www.yourdomain.com
```

## Security Notes

1. **Never commit secrets to version control**
   - Add `.env*` files to `.gitignore`
   - Use `.env.example` for documentation only

2. **Use strong secrets in production**
   - Generate a unique `NEXTAUTH_SECRET` for production
   - Use a password manager or secret management system

3. **HTTPS in production**
   - Always use HTTPS for production deployments
   - NextAuth.js requires HTTPS in production for security

## Troubleshooting

### Common Issues:

1. **API calls failing**: Check that `NEXT_PUBLIC_API_URL` points to your running backend
2. **Authentication not working**: Verify `NEXTAUTH_SECRET` is set correctly
3. **Redirect issues**: Ensure `NEXTAUTH_URL` matches your application URL

### Testing the setup:

1. Start your backend API server
2. Verify the backend is accessible at `NEXT_PUBLIC_API_URL`
3. Start your Next.js application
4. Test login and signup functionality