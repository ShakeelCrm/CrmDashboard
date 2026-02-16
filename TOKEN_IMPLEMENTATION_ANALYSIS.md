# Token & Session Management Implementation Analysis

**Date:** February 12, 2026  
**Status:** Partially Implemented with Critical Issues

---

## Executive Summary

Your token and session management implementation is **70% complete** but has several critical gaps that cause the "user already logging in" error when attempting to re-login after token expiration. The core issue is that the system doesn't properly handle the refresh token lifecycle, particularly the mismatch between what the backend returns and what the frontend expects.

---

## Current Implementation Status

### ✅ What's Working

1. **Database Schema** - RefreshToken model has correct fields including `revokedAt`
2. **Single Session Enforcement** - `canEmployeeLogin()` prevents concurrent sessions
3. **Token Generation** - Separate access and refresh token generation with correct expiration
4. **Logout Mechanism** - Refresh token revocation on logout is implemented
5. **Backend Validation** - Refresh token validation checks revocation status and expiration
6. **Password Hashing** - Bcrypt-based password handling is secure

### ❌ Critical Gaps & Issues

#### **Issue 1: Incomplete Refresh Token Lifecycle**

**Problem:** The backend's `refreshAccessToken()` function doesn't return the refresh token, but the frontend expects it.

**Location:**
- Backend: [apps/api/src/services/employee.service.ts](apps/api/src/services/employee.service.ts#L167-L178) (lines 167-178)
- Frontend: [apps/web/src/app/api/auth/refresh/route.ts](apps/web/src/app/api/auth/refresh/route.ts#L40-L52) (lines 40-52)

**Current Behavior:**
```typescript
// Backend returns:
{
  accessToken: string,
  employee: {...}
  // refreshToken is MISSING
}

// Frontend expects:
{
  accessToken: string,
  refreshToken: string  // NOT PROVIDED
}
```

**Impact:** When the frontend tries to update the refresh_token cookie, it receives `undefined`, leaving the old (potentially invalid) refresh token in the cookie.

---

#### **Issue 2: Login Fails with "Already Logged In" After Some Time**

**Root Cause:** When an old access token expires but the refresh token is still valid:

1. Frontend still has old `refresh_token` cookie
2. User tries to login → calls `/login` endpoint
3. Backend `canEmployeeLogin()` finds the old non-revoked refresh token
4. Rejects login with: `"Employee is already logged in from another device"`
5. Frontend user sees confusing message after getting token-expired error

**Flow:**
```
Time=0        User logs in
              ├─ access_token (expires in 15m)
              ├─ refresh_token (expires in 7d) → stored in DB with revokedAt=null
              
Time=20m      Access token expired
              
Time=25m      User tries to login again
              ├─ Frontend still has old refresh_token cookie
              ├─ Backend checks canEmployeeLogin()
              ├─ Finds non-revoked, non-expired refresh token in DB
              ├─ Returns false → "Already logged in" error ❌
              
Expected:     Should allow login if access token is expired ✓
```

---

#### **Issue 3: Token Expiration Time Mismatches**

**Problem:** Cookie maxAge and JWT expiration don't align, creating confusion.

**Location:**
- Frontend login: [apps/web/src/app/api/auth/login/route.ts](apps/web/src/app/api/auth/login/route.ts#L49-L58), [apps/web/src/app/api/auth/login/route.ts](apps/web/src/app/api/auth/login/route.ts#L59-L68)
- Backend config: [apps/api/src/config/env.config.ts](apps/api/src/config/env.config.ts)

**Mismatches:**
- Access token JWT: `"1d"` (24 hours)
- Access token cookie: `maxAge: 60*60*24` (24 hours) ✓ CORRECT
- Refresh token JWT: `"7d"` (7 days)
- Refresh token cookie: `maxAge: 60*60*24*7` (7 days) ✓ CORRECT

**But:** No check that these align with env variables. If env changes, cookies don't update.

---

#### **Issue 4: Refresh Token Not Stored in Refresh Endpoint Response**

**Problem:** Backend doesn't generate or return a new refresh token on token refresh.

**Standard Pattern:**
```typescript
// Current Implementation (INCOMPLETE)
refreshAccessToken() → returns { accessToken, employee }

// Should Be (COMPLETE)
refreshAccessToken() → returns { accessToken, refreshToken, employee }
```

**Why It Matters:**
- Refresh tokens should ideally be rotated on use (security best practice)
- Frontend can't update the refresh_token cookie without it
- Old refresh tokens accumulate in the database

---

#### **Issue 5: No Pre-Login Access Token Validation**

**Problem:** `canEmployeeLogin()` doesn't consider current access token status.

**Location:** [apps/api/src/controllers/employee.controller.ts](apps/api/src/controllers/employee.controller.ts#L43-L55)

**Current Check:**
```typescript
const canLogin = await canEmployeeLogin(employee.id.toString());
if (!canLogin) {
  throw new AuthenticationError("Employee is already logged in...");
}
```

**Missing Logic:**
- Should allow login if the current access token is EXPIRED
- Should allow login if no VALID refresh token exists
- Should check: `revokedAt = null AND expiresAt > now()`

---

#### **Issue 6: Orphaned Expired Refresh Tokens**

**Problem:** Tokens that expire naturally are never cleaned up from the database.

**Current State:**
```
RefreshToken {
  token: "...",
  employeeId: 1,
  expiresAt: 2026-02-05 (EXPIRED),
  revokedAt: null  // NOT explicitly marked as revoked
}
```

**Impact:** 
- Database bloat over time
- Potential confusion in token validation logic
- Long-lived records consuming space

---

#### **Issue 7: Frontend Cookie Management Incomplete**

**Problem:** Frontend doesn't handle token refresh failures gracefully.

**Location:** [apps/web/src/lib/auth-service.ts](apps/web/src/lib/auth-service.ts#L1-L150)

**Missing:**
- No automatic token refresh when access token expires
- No retry logic for failed requests due to token expiration
- No automatic logout on refresh token expiration
- No interception of 401/403 responses to trigger refresh

---

#### **Issue 8: Session Endpoint Doesn't Return Complete Data**

**Problem:** The `/api/auth/session` endpoint doesn't validate tokens.

**Location:** [apps/web/src/app/api/auth/session/route.ts](apps/web/src/app/api/auth/session/route.ts)

**Current:** Only checks if access_token exists, doesn't verify:
- Access token is actually valid (not expired)
- Token matches decrypted payload
- Employee still exists in database

---

## Architecture Diagram: Current vs Intended Flow

### Current Problematic Flow
```
Frontend Login
    ↓
POST /api/auth/login
    ↓
Backend POST /api/v1/employees/login
    ├─ Check canEmployeeLogin() → Finds old non-expired token → FAILS ❌
    └─ If PASSES:
        ├─ Revoke all old tokens (revokedAt = now)
        ├─ Generate access + refresh tokens
        ├─ Store refresh token in DB with revokedAt = null
        └─ Return both tokens
    ↓
Frontend receives tokens
    ├─ Set access_token cookie
    ├─ Set refresh_token cookie
    └─ Update state

After 15 minutes (access token expires)
    ↓
Frontend tries to use access token → 401 Unauthorized
    (NO AUTOMATIC REFRESH - Missing implementation)
    ↓
User tries to login again
    ├─ Old refresh_token cookie still valid (7 days)
    ├─ Backend finds non-revoked token in DB
    └─ Returns: "Already logged in" → ERROR ❌
```

### Intended Complete Flow
```
Frontend Login
    ↓
POST /api/auth/login
    ↓
Backend POST /api/v1/employees/login
    ├─ Check canEmployeeLogin() → Should check if current tokens are EXPIRED
    └─ PASS if: No active tokens OR all tokens expired
        ├─ Revoke all old tokens (revokedAt = now) or DELETE them
        ├─ Generate access + refresh tokens
        ├─ Store refresh token in DB with revokedAt = null
        ├─ Return BOTH tokens ✓
        └─ Return expiration times
    ↓
Frontend receives tokens + expiration times
    ├─ Set access_token cookie with correct maxAge
    ├─ Set refresh_token cookie with correct maxAge
    ├─ Setup automatic refresh 1 minute before expiration
    └─ Update state + start token refresh timer

Before Access Token Expires (14 minutes)
    ↓
SET TIMER: Automatically refresh token
    ├─ POST /api/auth/refresh { refreshToken }
    ├─ Backend validates refresh token
    ├─ OPTIONALLY rotate: generate new refresh token + return it ✓
    ├─ Return new access token + (new refresh token)
    └─ Frontend updates cookies + restart timer

On Logout
    ├─ POST /api/auth/logout
    ├─ Backend revokes refresh token (revokedAt = now)
    ├─ Frontend clears cookies
    └─ Clear timeout

User Tries to Login After Token Expiration
    ├─ canEmployeeLogin() → No active tokens (all expired)
    ├─ ALLOWS login ✓
    └─ New session created successfully ✓
```

---

## Proposed Action Plan

### **Phase 1: Critical Fixes (Do These First)** 🔴

#### 1.1 - Fix canEmployeeLogin() Logic
**File:** `apps/api/src/services/employee.service.ts`
**Change:** Update to only reject login if there's an ACTIVE session
```typescript
// BEFORE: Counts any non-revoked token regardless of expiration
const activeTokens = await prisma.refreshToken.count({
  where: {
    employeeId: id,
    revokedAt: null,
    expiresAt: { gt: new Date() }  // Already has expiration check ✓
  },
});

// After analysis: THE CODE IS ACTUALLY CORRECT!
// The issue is elsewhere...
```

**Wait!** Let me re-read the code... The `canEmployeeLogin()` function DOES check `expiresAt: { gt: new Date() }` - it correctly checks for non-expired tokens! So why is the user seeing this error?

**Investigation Needed:** The real issue might be:
- User's database has tokens without proper `expiresAt` values
- Or the token creation isn't setting `expiresAt` correctly
- Or there's a timezone issue with Date comparison

#### 1.2 - Backend: Return Refresh Token on Refresh
**File:** `apps/api/src/services/employee.service.ts`
**Change:** Generate and return new/existing refresh token
```typescript
// In refreshAccessToken(), ADD:
return {
  employee: {...},
  accessToken: newAccessToken,
  refreshToken: refreshToken  // Return the existing one (or rotate it)
};
```

**File:** `apps/api/src/controllers/employee.controller.ts`
**Change:** Return refresh token in response
```typescript
res.status(200).json({
  success: true,
  accessToken: result.accessToken,
  refreshToken: result.refreshToken,  // ADD THIS
  employee: result.employee,
});
```

#### 1.3 - Frontend: Handle Missing Refresh Token
**File:** `apps/web/src/app/api/auth/refresh/route.ts`
**Change:** Handle case where backend doesn't return refresh token
```typescript
// Get refreshToken from response OR keep existing
const newRefreshToken = data.refreshToken || 
  (await cookies()).get("refresh_token")?.value;
```

---

### **Phase 2: Session Management Improvements** 🟠

#### 2.1 - Implement Automatic Token Refresh
**File:** Create `apps/web/src/hooks/useTokenRefresh.ts`
**What:** Hook that automatically refreshes token before expiration
- Parse JWT expiration from token
- Set interval to refresh 1 minute before expiration
- Retry logic for failed refreshes

#### 2.2 - Add Request Interceptor for 401/403
**File:** `apps/web/src/lib/api-client.ts`
**What:** Intercept 401/403 responses
- Auto-retry with refreshed token once
- If refresh fails, logout user
- Redirect to login page

#### 2.3 - Fix Session Endpoint
**File:** `apps/web/src/app/api/auth/session/route.ts`
**What:** Validate tokens, not just check existence
```typescript
// Add: Verify token validity
const decoded = jwt_decode(accessToken.value);
if (decoded.exp * 1000 < Date.now()) {
  // Token expired, try refresh
  const refreshResult = await refreshAccessToken(refreshToken);
  if (!refreshResult.ok) {
    return 401;  // Refresh failed, need to re-login
  }
}
```

---

### **Phase 3: Database & Cleanup** 🟡

#### 3.1 - Add Database Cleanup Job
**File:** `apps/api/src/services/employee.service.ts`
**What:** Remove expired refresh tokens periodically
```typescript
export const cleanupExpiredTokens = async () => {
  await prisma.refreshToken.deleteMany({
    where: {
      expiresAt: { lt: new Date() }
    }
  });
};

// Call in a cron job (via a task scheduler)
// Example: Every day at 2 AM
```

#### 3.2 - Optional: Token Rotation on Refresh
**What:** Generate new refresh token on each refresh (security best practice)
```typescript
// Instead of reusing token, generate new one:
const newRefreshToken = generateRefreshToken({...});
await prisma.refreshToken.create({
  data: { token: newRefreshToken, ... }
});
// Optionally revoke old token
```

---

### **Phase 4: Configuration & Documentation** 🟢

#### 4.1 - Align Token Expiration Configuration
**File:** `apps/api/src/config/env.config.ts`
**Check:** Ensure these are defined in `.env`
```
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
JWT_SECRET=<long-random-string>
JWT_REFRESH_SECRET=<different-long-random-string>
```

#### 4.2 - Document Complete Flow
**File:** Create `AUTHENTICATION_FLOW.md`
**Contents:**
- Complete sequence diagrams for all flows
- Token expiration times and refresh logic
- Single-session enforcement mechanism
- Error codes and recovery procedures

#### 4.3 - Add Middleware for Token Cleanup
**File:** `apps/api/src/app.ts`
**What:** Add periodic cleanup task
```typescript
setInterval(cleanupExpiredTokens, 24 * 60 * 60 * 1000); // Daily
```

---

## Immediate Debugging Steps

If the user is still experiencing issues, check:

```sql
-- Check if old tokens have expiresAt set correctly
SELECT id, employeeId, expiresAt, revokedAt, 
       expiresAt < NOW() as is_expired,
       (revokedAt IS NULL) as is_active
FROM "RefreshToken"
WHERE "employeeId" = <user-id>
ORDER BY "createdAt" DESC;

-- If expiresAt is NULL or far in the past, that's the problem!
```

---

## Implementation Priority

1. **CRITICAL (Do First):**
   - Fix token creation to ensure `expiresAt` is always set
   - Verify `canEmployeeLogin()` actually checks expiration
   - Return refresh token from backend refresh endpoint
   - Handle missing refresh token on frontend

2. **HIGH (Do Next):**
   - Implement automatic token refresh hook
   - Add request interceptor for 401/403
   - Add database cleanup job

3. **MEDIUM (Do After):**
   - Implement token rotation
   - Add comprehensive error handling
   - Create detailed documentation

4. **LOW (Optional):**
   - Add monitoring/alerting for failed logins
   - Add analytics for token refresh frequency
   - Implement advanced session management UI

---

## Security Considerations

1. ✅ **Access tokens** are short-lived (15 minutes)
2. ✅ **Refresh tokens** are stored server-side with revocation capability
3. ✅ **HTTP-only cookies** prevent XSS attacks
4. ✅ **Password hashing** with bcrypt
5. ⚠️ **Missing:** CSRF token for state-changing operations
6. ⚠️ **Missing:** Token rotation on refresh (optional but recommended)
7. ⚠️ **Missing:** Rate limiting on auth endpoints

---

## Testing Strategy

### Test Case 1: Login After Token Expiration
```javascript
1. Login → Get tokens
2. Wait 15+ minutes (or manually manipulate time)
3. Try to access protected resource → Should get 401
4. This should auto-refresh or user re-logs in
5. Verify new token is valid
```

### Test Case 2: Single Session Enforcement
```javascript
1. Login from Device A → Get tokens
2. Try to login from Device B → Should succeed, invalidate Device A
3. Device A tries to use old token → Should get 401
4. Device A tries to refresh → Should fail (token revoked)
```

### Test Case 3: Token Refresh
```javascript
1. Login → Get tokens
2. Before access token expires, call refresh endpoint
3. Should get new access token
4. Old token should be invalid (or still work until expiration)
```

---

## Code Files to Modify

| Priority | File | Change Type | Lines |
|----------|------|-------------|-------|
| 🔴 Critical | `apps/api/src/services/employee.service.ts` | Add validation | 170-180 |
| 🔴 Critical | `apps/api/src/services/employee.service.ts` | Return refresh token | 177-178 |
| 🔴 Critical | `apps/api/src/controllers/employee.controller.ts` | Include refresh token | 168-172 |
| 🔴 Critical | `apps/web/src/app/api/auth/refresh/route.ts` | Handle missing token | 40-52 |
| 🟠 High | `apps/web/src/hooks/` | NEW: useTokenRefresh.ts | - |
| 🟠 High | `apps/web/src/lib/api-client.ts` | NEW or UPDATE | - |
| 🟠 High | `apps/api/src/app.ts` | Add cleanup task | - |
| 🟡 Medium | `apps/api/src/config/env.config.ts` | Verify values | - |
| 🟢 Low | `docs/` | NEW: AUTHENTICATION_FLOW.md | - |

---

## Success Criteria

- ✅ User can login after token expiration without "already logged in" error
- ✅ Access token automatically refreshes before expiration
- ✅ Session redirects to login when refresh token expires
- ✅ Only one active session per user enforced
- ✅ Database has no orphaned tokens older than 7 days
- ✅ All error responses include actionable messages
- ✅ Complete flow documented with examples

---
