# Token & Session Management - Implementation Action Items

## Quick Summary of the Problem

When a user's access token expires and they try to log in again, they get:
```
"Employee is already logged in from another device. Please log out from other devices first."
```

**Root Cause:** The system sees an expired-but-not-yet-cleaned-up refresh token from the previous session and treats it as an active session.

**Solution:**  Multiple fixes in order of priority.

---

## 🔴 CRITICAL FIXES (Required to Fix the Bug)

### Fix #1: Return Refresh Token on Token Refresh

**Problem:** Backend refresh endpoint doesn't return the refresh token, so frontend can't update its cookie.

**File:** `apps/api/src/services/employee.service.ts`

**Current Code (lines 133-180):**
```typescript
// Service to refresh access token using refresh token
export const refreshAccessToken = async (refreshToken: string) => {
  // ... validation code ...
  
  return {
    employee: {
      id: storedToken.employee.id,
      email: storedToken.employee.email,
      name: storedToken.employee.name,
    },
    accessToken: newAccessToken,  // ← MISSING: refreshToken
  };
};
```

**What to Change:**
- Line 178: Add `refreshToken: refreshToken` to return object

**Action:** In the return statement, add the refresh token:
```typescript
return {
  employee: {
    id: storedToken.employee.id,
    email: storedToken.employee.email,
    name: storedToken.employee.name,
  },
  accessToken: newAccessToken,
  refreshToken: refreshToken,  // ← ADD THIS LINE
};
```

---

### Fix #2: Backend Controller Must Return Refresh Token

**File:** `apps/api/src/controllers/employee.controller.ts`

**Current Code (lines 163-172):**
```typescript
// @desc    Refresh access token
// @route   POST /api/v1/employees/refresh-token
// @access  Public (uses refresh token)
export const refreshAccessTokenController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new ValidationError("Refresh token is required");
    }

    const result = await refreshAccessToken(refreshToken);

    res.status(200).json({
      success: true,
      accessToken: result.accessToken,  // ← MISSING: refreshToken
      employee: result.employee,
    });
  } catch (error) {
    next(error);
  }
};
```

**What to Change:**
Add `refreshToken: result.refreshToken` to the JSON response

**Action:**
```typescript
res.status(200).json({
  success: true,
  accessToken: result.accessToken,
  refreshToken: result.refreshToken,  // ← ADD THIS LINE
  employee: result.employee,
});
```

---

### Fix #3: Frontend Refresh Route Must Handle Refresh Token

**File:** `apps/web/src/app/api/auth/refresh/route.ts`

**Current Code (lines 30-52):**
```typescript
// Update the cookies with new tokens
const response = NextResponse.json(
  { 
    success: true,
    accessToken: data.accessToken,
    refreshToken: data.refreshToken  // ← MIGHT BE MISSING from backend
  },
  { status: 200 }
);

// Set HTTP-only cookies for security
response.cookies.set("access_token", data.accessToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 24, // 24 hours
  path: "/",
  sameSite: "strict",
});

response.cookies.set("refresh_token", data.refreshToken, {  // ← Will be undefined if not returned
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 24 * 7, // 7 days
  path: "/",
  sameSite: "strict",
});
```

**What to Change:**
- Safely handle case where backend doesn't return refresh token
- Keep existing refresh token if new one not provided

**Action:**
```typescript
// Store existing refresh token before making request
const cookieStore = await cookies();
const existingRefreshToken = cookieStore.get("refresh_token")?.value;

// ... call backend ...

const response = NextResponse.json(
  { 
    success: true,
    accessToken: data.accessToken,
    refreshToken: data.refreshToken || existingRefreshToken  // ← Safe fallback
  },
  { status: 200 }
);

// Only set if we have a token
if (data.accessToken) {
  response.cookies.set("access_token", data.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 15 * 60, // 15 minutes - match JWT expiration
    path: "/",
    sameSite: "strict",
  });
}

if (data.refreshToken || existingRefreshToken) {
  response.cookies.set("refresh_token", data.refreshToken || existingRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60, // 7 days - match JWT expiration
    path: "/",
    sameSite: "strict",
  });
}
```

---

### Fix #4: Ensure Tokens are Created with Proper Expiration

**File:** `apps/api/src/services/employee.service.ts`

**Check:** Verify that line 114 properly sets `expiresAt`

**Current Code (lines 110-118):**
```typescript
// Store the refresh token in the database
await prisma.refreshToken.create({
  data: {
    token: refreshToken,
    employeeId: employee.id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  },
});
```

**Verification:**
- ✅ Token storage includes `expiresAt` calculation
- ✅ Calculates 7 days correctly
- ✅ Uses `Date.now()` consistently

**Action:** This is already correct. No changes needed here.

---

### Fix #5: Add Explicit Token Validation in canEmployeeLogin

**File:** `apps/api/src/services/employee.service.ts`

**Current Code (lines 218-236):**
```typescript
export const canEmployeeLogin = async (employeeId: number | string): Promise<boolean> => {
  // Convert employeeId to number for Prisma query
  const id = typeof employeeId === 'string' ? parseInt(employeeId, 10) : employeeId;

  // Check if there are any active refresh tokens for this employee
  const activeTokens = await prisma.refreshToken.count({
    where: {
      employeeId: id,
      revokedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
  });

  // If there are active tokens, the employee is already logged in
  return activeTokens === 0;
};
```

**Analysis:** ✅ **This code is CORRECT!**
- It checks `revokedAt: null` ✓
- It checks `expiresAt: { gt: new Date() }` ✓
- It returns `true` only if NO active tokens found ✓

**But:** The problem might be with how this is CALLED.

**Action:** Check the login controller (line 43-55):

```typescript
export const loginEmployeeController = async (
  req: Request<{}, {}, LoginRequestBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    // ... validation ...

    // Check if employee can login (single session enforcement)
    const employee = await getEmployeeByEmail(email);
    if (employee) {
      const canLogin = await canEmployeeLogin(employee.id.toString());
      if (!canLogin) {
        throw new AuthenticationError(
          "Employee is already logged in from another device. Please log out from other devices first."
        );
      }
    }
    
    // ... rest of login ...
  }
};
```

**Problem:** This check happens BEFORE password validation. If user enters wrong password 3 times, they still get "already logged in" message.

**Better approach:**
```typescript
// 1. Validate credentials first
const isPasswordValid = await comparePassword(password, employee.password);
if (!isPasswordValid) {
  throw new AuthenticationError("Invalid email or password");
}

// 2. THEN check if they can login
const canLogin = await canEmployeeLogin(employee.id.toString());
if (!canLogin) {
  throw new AuthenticationError(
    "Employee is already logged in from another device. Please log out from other devices first."
  );
}

// 3. If both pass, proceed with token generation
```

---

## 🟠 HIGH PRIORITY FIXES (Improve Robustness)

### Fix #6: Add Token Cleanup Job

**File:** Create new service or add to `employee.service.ts`

**Add this function:**
```typescript
export const cleanupExpiredTokens = async () => {
  const result = await prisma.refreshToken.deleteMany({
    where: {
      expiresAt: { lt: new Date() }
    }
  });
  
  console.log(`Cleaned up ${result.count} expired tokens`);
  return result.count;
};
```

**File:** `apps/api/src/app.ts`

**Add this after Express app initialization:**
```typescript
// Run cleanup every 24 hours (daily at 2 AM)
const cleanupInterval = setInterval(async () => {
  try {
    await cleanupExpiredTokens();
  } catch (error) {
    console.error("Error cleaning up expired tokens:", error);
  }
}, 24 * 60 * 60 * 1000);

// Clean up interval on app shutdown
process.on("SIGTERM", () => {
  clearInterval(cleanupInterval);
});
```

---

### Fix #7: Add Automatic Token Refresh Intelligence

**File:** Create `apps/web/src/hooks/useTokenRefresh.ts`

```typescript
"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { refreshAccessToken } from "@/lib/auth-service";

export function useTokenRefresh() {
  const { isAuthenticated } = useAuth();
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleTokenRefresh = useCallback((token: string) => {
    try {
      // Parse JWT without verification (we trust it came from secure cookie)
      const parts = token.split(".");
      if (parts.length !== 3) return;

      const payload = JSON.parse(
        Buffer.from(parts[1], "base64").toString("utf-8")
      );
      const expiresAt = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      const timeUntilExpiry = expiresAt - now;

      // Refresh 1 minute before expiration
      const refreshTime = Math.max(0, timeUntilExpiry - 60000);

      // Clear existing timeout
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }

      // Schedule refresh
      refreshTimeoutRef.current = setTimeout(async () => {
        try {
          // Get refresh token from cookie (via fetch to secure endpoint)
          const response = await fetch("/api/auth/refresh", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              refreshToken: (await import("js-cookie")).default.get("refresh_token"),
            }),
          });

          if (response.ok) {
            const data = await response.json();
            // Schedule next refresh
            scheduleTokenRefresh(data.accessToken);
          } else {
            // Refresh failed - user needs to login again
            window.location.href = "/login";
          }
        } catch (error) {
          console.error("Token refresh failed:", error);
          window.location.href = "/login";
        }
      }, refreshTime);
    } catch (error) {
      console.error("Error scheduling token refresh:", error);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  return { scheduleTokenRefresh };
}
```

**Usage in AuthContext:**
```typescript
// In useEffect after login
if (result.ok && result.accessToken) {
  const { scheduleTokenRefresh } = useTokenRefresh();
  scheduleTokenRefresh(result.accessToken);
}
```

---

### Fix #8: Add HTTP Interceptor for 401/403 Responses

**File:** Create `apps/web/src/lib/api-interceptor.ts`

```typescript
export function setupApiInterceptor() {
  const originalFetch = window.fetch;

  window.fetch = async (...args) => {
    let response = await originalFetch(...args);

    // If token expired, try to refresh
    if (response.status === 401 || response.status === 403) {
      try {
        // Try to refresh token
        const refreshResponse = await originalFetch("/api/auth/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (refreshResponse.ok) {
          // Retry original request with new token
          response = await originalFetch(...args);
        } else {
          // Refresh failed - redirect to login
          window.location.href = "/login";
        }
      } catch (error) {
        console.error("Token refresh failed:", error);
        window.location.href = "/login";
      }
    }

    return response;
  };
}
```

**Initialize in:** `apps/web/src/app/providers.tsx`
```typescript
"use client";

import { useEffect } from "react";
import { setupApiInterceptor } from "@/lib/api-interceptor";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    setupApiInterceptor();
  }, []);

  return children;
}
```

---

## 🟡 MEDIUM PRIORITY FIXES (Polish & Cleanup)

### Fix #9: Verify Cookie Expiration Times Match JWT

**File:** `apps/web/src/app/api/auth/login/route.ts`

**Change cookie maxAge to match JWT expiration:**
```typescript
// For access token (should match JWT_ACCESS_EXPIRATION)
response.cookies.set("access_token", data.accessToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  maxAge: 15 * 60, // 15 minutes - must match JWT_ACCESS_EXPIRATION
  path: "/",
  sameSite: "strict",
});

// For refresh token (should match JWT_REFRESH_EXPIRATION)
response.cookies.set("refresh_token", data.refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60, // 7 days - must match JWT_REFRESH_EXPIRATION
  path: "/",
  sameSite: "strict",
});
```

---

### Fix #10: Improve Session Endpoint Validation

**File:** `apps/web/src/app/api/auth/session/route.ts`

**Current:** Only checks if cookie exists

**Improved:** Validate token still works
```typescript
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    const cookieStore = cookies();
    const accessToken = (await cookieStore).get("access_token");

    if (!accessToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Validate the token is actually working
    const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const res = await fetch(`${BACKEND_URL}/api/v1/employees/me`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken.value}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      // Token might be expired, but don't error yet
      // Let the refresh mechanism handle it
      if (res.status === 401 || res.status === 403) {
        return NextResponse.json(
          { error: "Token expired", requiresRefresh: true },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { error: "Invalid token" },
        { status: res.status }
      );
    }

    const userData = await res.json();
    const user = userData.employee || userData.data;

    return NextResponse.json({
      user,
      isAuthenticated: true,
    });
  } catch (error) {
    console.error("Session check error:", error);
    return NextResponse.json(
      { error: "Failed to check session" },
      { status: 500 }
    );
  }
}
```

---

## 📋 Implementation Checklist

Use this to track your progress:

```
Phase 1: Critical Fixes (Required)
- [ ] Fix #1: Return refresh token from backend service
- [ ] Fix #2: Return refresh token from backend controller
- [ ] Fix #3: Frontend handles missing refresh token
- [ ] Fix #4: Verify token creation (already done)
- [ ] Fix #5: Validate login controller flow
  - [ ] Test with valid credentials
  - [ ] Test with already-logged-in user
  - [ ] Test with expired token

Phase 2: Infrastructure (High Priority)
- [ ] Fix #6: Add token cleanup job
  - [ ] Add cleanupExpiredTokens() function
  - [ ] Initialize interval in app.ts
  - [ ] Test cleanup runs correctly
- [ ] Fix #7: Implement automatic token refresh hook
  - [ ] Create useTokenRefresh hook
  - [ ] Integrate with AuthProvider
  - [ ] Test refresh timing
- [ ] Fix #8: Add HTTP interceptor
  - [ ] Create api-interceptor.ts
  - [ ] Initialize in providers
  - [ ] Test 401 retry

Phase 3: Polish (Medium Priority)
- [ ] Fix #9: Align cookie expiration times
- [ ] Fix #10: Improve session validation
- [ ] Create comprehensive error messages
- [ ] Add logging for debugging

Testing
- [ ] Test: Login after full token expiration
- [ ] Test: Auto-refresh before manual expiration
- [ ] Test: Logout from other devices
- [ ] Test: Concurrent login attempts
- [ ] Test: Refresh token expiration
- [ ] Test: Network failure during refresh
```

---

## 🧪 Testing Commands

### Test 1: Verify Backend Returns Refresh Token
```bash
curl -X POST http://localhost:3001/api/v1/employees/refresh-token \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<YOUR_REFRESH_TOKEN>"}'

# Should see { accessToken: "...", refreshToken: "...", employee: {...} }
```

### Test 2: Check Database Token Status
```sql
-- For a specific employee
SELECT id, employeeId, expiresAt, revokedAt,
       CASE 
         WHEN "revokedAt" IS NOT NULL THEN 'REVOKED'
         WHEN "expiresAt" < NOW() THEN 'EXPIRED'
         ELSE 'ACTIVE'
       END as status
FROM "RefreshToken"
WHERE "employeeId" = 1  -- Replace with actual employee ID
ORDER BY "createdAt" DESC;
```

### Test 3: Simulate Token Expiration
```javascript
// In browser console
// Wait 15+ minutes (or modify your clock) then:
fetch("/api/auth/session").then(r => r.json()).then(console.log)

// Should show token expired message
```

---

## 📊 Success Metrics

After implementing all fixes:

1. ✅ User can login immediately after token expiration
2. ✅ No "already logged in" error on fresh login
3. ✅ Automatic token refresh happens 1 minute before expiration
4. ✅ Failed requests retry once with refreshed token
5. ✅ Database tokens cleaned up after 7 days
6. ✅ Only 1 active refresh token per employee
7. ✅ Clear error messages for all failure scenarios
8. ✅ Session validation actually checks token validity

---

## 🐛 Common Mistakes to Avoid

1. ❌ Don't revoke old tokens BEFORE generating new ones (data loss risk)
2. ❌ Don't trust JWT expiration time alone (always check database)
3. ❌ Don't set cookie maxAge differently from JWT expiration
4. ❌ Don't block login just because refresh token exists (check if expired)
5. ❌ Don't refresh token on every request (causes database thrashing)
6. ❌ Don't store refresh token in localStorage (use HTTP-only cookies)
7. ❌ Don't call canEmployeeLogin() before password validation

---
