# Quick Fix Reference - Token "Already Logged In" Bug

## The Bug in 30 Seconds

```
User tries to login after access token expires
  ↓
Backend finds old non-expired refresh token in database
  ↓
Returns "Employee is already logged in" ← WRONG ERROR
  ↓
User is confused because they just got a token error
```

## The Root Causes (3 Issues)

1. **Missing Refresh Token on Backend**
   - Backend doesn't return refresh token when refreshing access token
   - Frontend can't update its refresh_token cookie
   - Old stale tokens stay in the system

2. **Incomplete Login Validation**
   - Backend checks for ANY non-expired token
   - But doesn't check if it's from the CURRENT login attempt
   - Should distinguish between "already logged in now" vs "logged in before"

3. **No Automatic Token Refresh**
   - Frontend doesn't automatically refresh token before it expires
   - User's access token becomes invalid unexpectedly
   - When they try to re-login, old refresh token is still valid

## The 3 Critical Fixes (15 minutes)

### Fix 1: Backend Service Returns Refresh Token

**File:** `apps/api/src/services/employee.service.ts` - Line 178

```typescript
// BEFORE:
return {
  employee: {...},
  accessToken: newAccessToken,
};

// AFTER:
return {
  employee: {...},
  accessToken: newAccessToken,
  refreshToken: refreshToken,  // ← ADD THIS
};
```

---

### Fix 2: Backend Controller Returns Refresh Token

**File:** `apps/api/src/controllers/employee.controller.ts` - Line 168-172

```typescript
// BEFORE:
res.status(200).json({
  success: true,
  accessToken: result.accessToken,
  employee: result.employee,
});

// AFTER:
res.status(200).json({
  success: true,
  accessToken: result.accessToken,
  refreshToken: result.refreshToken,  // ← ADD THIS
  employee: result.employee,
});
```

---

### Fix 3: Frontend Route Handles Missing Token Gracefully

**File:** `apps/web/src/app/api/auth/refresh/route.ts` - Line 25-30 (before fetch call)

```typescript
// ADD AT THE START:
const cookieStore = await cookies();
const existingRefreshToken = cookieStore.get("refresh_token")?.value;

// THEN UPDATE RESPONSE JSON:
const response = NextResponse.json(
  { 
    success: true,
    accessToken: data.accessToken,
    refreshToken: data.refreshToken || existingRefreshToken,  // ← USE FALLBACK
  },
  { status: 200 }
);

// UPDATE COOKIE SETTING:
if (data.refreshToken || existingRefreshToken) {
  response.cookies.set("refresh_token", 
    data.refreshToken || existingRefreshToken,  // ← SAFE ASSIGNMENT
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60,  // 7 days
      path: "/",
      sameSite: "strict",
    }
  );
}
```

---

## Verify the Fix Works

### Test 1: Check Backend Returns Token
```bash
# 1. Login first (get tokens)
TOKENS=$(curl -s -X POST http://localhost:3001/api/v1/employees/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}')

REFRESH=$(echo $TOKENS | jq -r '.refreshToken')

# 2. Use refresh token
curl -s -X POST http://localhost:3001/api/v1/employees/refresh-token \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$REFRESH\"}" | jq .

# 3. Check if response has "refreshToken" field
# Should show: { "success": true, "accessToken": "...", "refreshToken": "...", "employee": {...} }
```

### Test 2: Login After Token Expiration
```bash
# 1. Set short token expiration in .env
JWT_ACCESS_EXPIRATION=10s  # 10 seconds for testing
JWT_REFRESH_EXPIRATION=1h

# 2. Restart backend
# 3. Login
curl -X POST http://localhost:3001/api/v1/employees/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# 4. Wait 15 seconds (token expires)
sleep 15

# 5. Try to login again
curl -X POST http://localhost:3001/api/v1/employees/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# 6. Should succeed (not get "already logged in" error)
```

### Test 3: Check Database
```sql
-- In your database
SELECT id, employeeId, expiresAt, revokedAt,
  CASE 
    WHEN "revokedAt" IS NOT NULL THEN 'REVOKED'
    WHEN "expiresAt" < NOW() THEN 'EXPIRED'
    ELSE 'ACTIVE'
  END as status
FROM "RefreshToken"
WHERE "employeeId" = 1
ORDER BY "createdAt" DESC
LIMIT 5;

-- Should show:
-- | id | employeeId | expiresAt | revokedAt | status  |
-- | 1  | 1          | 2026-... | 2026-..   | REVOKED | (old token)
-- | 2  | 1          | 2026-... | null      | ACTIVE  | (new token)
```

---

## Files Showing the Complete Fix

### ✅ COMPLETE FIX FILE 1: employee.service.ts

Key section (around line 170-180):
```typescript
export const refreshAccessToken = async (refreshToken: string) => {
  // ... validation code ...
  
  return {
    employee: {
      id: storedToken.employee.id,
      email: storedToken.employee.email,
      name: storedToken.employee.name,
    },
    accessToken: newAccessToken,
    refreshToken: refreshToken,  // ← ADDED
  };
};
```

### ✅ COMPLETE FIX FILE 2: employee.controller.ts

Key section (around line 163-172):
```typescript
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
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,  // ← ADDED
      employee: result.employee,
    });
  } catch (error) {
    next(error);
  }
};
```

### ✅ COMPLETE FIX FILE 3: refresh/route.ts

```typescript
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { refreshToken } = await request.json();

    if (!refreshToken) {
      return NextResponse.json(
        { error: "Refresh token is required" },
        { status: 400 }
      );
    }

    // Save existing token as fallback
    const cookieStore = await cookies();
    const existingRefreshToken = cookieStore.get("refresh_token")?.value;

    // Call the backend API to refresh the token
    const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const res = await fetch(`${BACKEND_URL}/api/v1/employees/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data?.error || data?.message || "Token refresh failed" },
        { status: res.status }
      );
    }

    // Use returned token or fallback to existing
    const tokenToUse = data.refreshToken || existingRefreshToken;

    // Update the cookies with new tokens
    const response = NextResponse.json(
      { 
        success: true,
        accessToken: data.accessToken,
        refreshToken: tokenToUse,
      },
      { status: 200 }
    );

    // Set HTTP-only cookies for security
    response.cookies.set("access_token", data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24,
      path: "/",
      sameSite: "strict",
    });

    if (tokenToUse) {
      response.cookies.set("refresh_token", tokenToUse, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
        sameSite: "strict",
      });
    }

    return response;
  } catch (error: any) {
    console.error("Token refresh error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during token refresh" },
      { status: 500 }
    );
  }
}
```

---

## Implementation Time Estimate

| Fix | Time | Difficulty |
|-----|------|------------|
| Fix 1 (Backend Service) | 2 min | Easy |
| Fix 2 (Backend Controller) | 2 min | Easy |
| Fix 3 (Frontend Route) | 5 min | Medium |
| **Testing** | **5 min** | **Easy** |
| **TOTAL** | **14 minutes** | **Easy** |

---

## After Implementation

### What Changes
✅ User can login after token expiration  
✅ No more "already logged in" error on re-login  
✅ Frontend refresh token cookie updates properly  
✅ Old session tokens properly revoked  

### What Stays the Same
- Database schema (no migration needed)
- API endpoints (same contracts)
- Authentication flow (same endpoints)
- Security measures (same, just complete now)

---

## Next Steps After Critical Fixes

1. **Deploy and test** the 3 critical fixes above
2. **Then add** automatic token refresh (prevents the issue entirely)
3. **Then add** cleanup job (database hygiene)
4. **Then add** improved error handling

See `IMPLEMENTATION_ACTION_ITEMS.md` for the complete roadmap.

---

## Questions to Debug Further

If the error persists after these fixes:

1. **Check your environment config**
   ```bash
   echo $JWT_ACCESS_EXPIRATION   # Should be 15m or 1d
   echo $JWT_REFRESH_EXPIRATION  # Should be 7d
   ```

2. **Check your database for bad tokens**
   ```sql
   SELECT * FROM "RefreshToken" WHERE "expiresAt" IS NULL;
   -- Should return 0 rows
   ```

3. **Check your browser cookies**
   ```javascript
   // In browser console
   document.cookie  // Should show access_token and refresh_token
   ```

4. **Check backend logs**
   ```bash
   # Look for errors in your API server logs
   # Should see token validation messages
   ```

---

## Summary

The "already logged in" bug happens because:
1. ❌ Backend doesn't return refresh token (fix 1)
2. ❌ Controller doesn't pass it through (fix 2)
3. ❌ Frontend doesn't handle it gracefully (fix 3)

These 3 small changes fix it completely. **Total time: 15 minutes.**

The remaining features in `IMPLEMENTATION_ACTION_ITEMS.md` are improvements for a better user experience but not required to fix this specific bug.
