# Token Management Analysis - Visual Summary

## 🎯 The Issue at a Glance

```
Timeline of the Bug:

T=0        User logs in
           ├─ Receives: access_token (15 min), refresh_token (7 days)
           └─ DB stores: RefreshToken with revokedAt=null, expiresAt=future

T=20 min   Access token expires
           └─ User doesn't notice (no auto-refresh yet)

T=30 min   User tries to navigate to protected page
           ├─ Access token is INVALID
           └─ [NO AUTO-REFRESH - MISSING FEATURE]

T=31 min   User tries to login again
           ├─ Frontend: Still has old refresh_token cookie
           ├─ Backend: Checks canEmployeeLogin()
           ├─ Backend: Finds refresh_token in DB (revokedAt=null, expiresAt=future)
           ├─ Backend: Says "Already logged in" ← WRONG! ❌
           └─ User confused because they just got token error

Expected:  Should allow login (since access token is expired) ✓
```

---

## 📊 Current Implementation Status

```
┌─────────────────────────────────────────────────────────────┐
│                 TOKEN LIFECYCLE STATUS                      │
└─────────────────────────────────────────────────────────────┘

CREATION (Login)
  ├─ ✅ Backend generates access & refresh tokens
  ├─ ✅ Stores refresh token in DB with expiresAt
  ├─ ✅ Sets revokedAt = null
  └─ ✅ Returns both to frontend

VALIDATION (Using Token)
  ├─ ✅ Middleware checks access token validity
  ├─ ✅ Business logic validates token signature
  └─ ✅ Returns 401 if invalid

REFRESH (When Access Expires)
  ├─ ✅ Backend validates refresh token
  ├─ ✅ Backend checks revokedAt & expiresAt
  ├─ ✅ Backend generates new access token
  ├─ ❌ Backend DOESN'T return refresh token ← ISSUE #1
  └─ ❌ Frontend can't update its refresh_token cookie ← ISSUE #2

SESSION CHECK (Is User Still Logged In?)
  ├─ ✅ Backend finds non-revoked tokens
  ├─ ✅ Backend checks if not expired
  └─ ✅ Logic is actually CORRECT! The problem is BEFORE this.

LOGOUT (Done Using Session)
  ├─ ✅ Backend finds refresh token
  ├─ ✅ Sets revokedAt = now()
  └─ ✅ Frontend clears cookies

CLEANUP (Old Tokens)
  ├─ ❌ Expired tokens NOT deleted ← ISSUE #3
  ├─ ❌ No background cleanup job
  └─ ❌ Database accumulates dead tokens
```

---

## 🔄 Current Flow vs Expected Flow

### Current (Problematic) Flow

```
┌──────────────────────────────────────────────────────────────┐
│ FRONTEND LOGIN PAGE                                          │
│ User enters: email, password                                 │
└─────────────────┬──────────────────────────────────────────┘
                  │
                  ▼
        ┌─────────────────────┐
        │ POST /api/auth/login│
        └────────┬────────────┘
                 │
                 ▼
    ┌────────────────────────────────────┐
    │ Backend: Check canEmployeeLogin()  │
    │ - Find non-revoked, non-expired    │
    │   refresh tokens                   │
    │                                    │
    │ COUNT WHERE:                       │
    │   employeeId = X                   │
    │   revokedAt = null                 │
    │   expiresAt > NOW()                │
    └────────────┬───────────────────────┘
                 │
          ┌──────┴──────┐
          │             │
        Count=0      Count>0
        (OK)        (ALREADY IN)
        │             │
        ▼             ▼
    ┌────────┐  ┌──────────────────┐
    │ALLOW   │  │REJECT WITH ERROR │
    │LOGIN   │  │"Already Logged In"│
    └────┬───┘  └──────────────────┘
         │
         ▼
    ┌─────────────────────────────────────┐
    │ Generate tokens                     │
    │ - New access_token (15 min valid)   │
    │ - New refresh_token (7 day valid)   │
    └─────────┬───────────────────────────┘
              │
              ▼
    ┌─────────────────────────────────────┐
    │ Store in database                   │
    │ - RefreshToken table                │
    │ - id, token, employeeId             │
    │ - expiresAt = now + 7d              │
    │ - revokedAt = null                  │
    └─────────┬───────────────────────────┘
              │
              ▼
    ┌──────────────────────────────────────┐
    │ Return response                      │
    │ {                                    │
    │   success: true,                     │
    │   accessToken: "...",                │
    │   refreshToken: "...",               │
    │   employee: {...}                    │
    │ }                                    │
    └──────────┬───────────────────────────┘
               │
               ▼
    ┌──────────────────────────────────────┐
    │ FRONTEND RECEIVES                    │
    │ ├─ Stores access_token in cookie     │
    │ ├─ Stores refresh_token in cookie    │
    │ ├─ Updates user state                │
    │ └─ Redirects to dashboard            │
    └──────────────────────────────────────┘

    PROBLEM: If old refresh token still exists
    and is not expired, second login gets
    "Already logged in" error! ❌
```

### Expected (Fixed) Flow

```
┌──────────────────────────────────────────────────────────────┐
│ FRONTEND
│                                                              │
│ T=0: User logs in                                           │
│ ├─ access_token (expires 15 min)        ✓                  │
│ ├─ refresh_token (expires 7 day)        ✓                  │
│ └─ Start refresh timer                  ✓ (needed)         │
│                                                              │
│ T=14 min: BEFORE TOKEN EXPIRES                              │
│ ├─ Timer fires: Auto-refresh            ✓ (needed)         │
│ ├─ POST /refresh with refresh_token     ✓ (exists)         │
│ ├─ Receive new access_token             ✓ (exists)         │
│ ├─ Receive new refresh_token (optional) ✓ (missing)        │
│ ├─ Update cookies                       ✓ (needs fix for #2)
│ └─ Restart timer                        ✓ (needed)         │
│                                                              │
│ T=N days: When refresh expires                              │
│ ├─ Session check finds expired token    ✓ (works)          │
│ └─ Auto-redirect to login               ✓ (needed)         │
│                                                              │
│ T=anytime: User can login (access expired but allowed to)   │
│ ├─ DB cleanup removed old tokens        ✓ (needed)         │
│ └─ Fresh session created                ✓ (works)          │
│                                                              │
└──────────────────────────────────────────────────────────────┘

BACKEND
│
├─ Generates access + refresh tokens        ✓
├─ Returns refresh token on refresh         ✗ Fix #1
├─ Stores tokens with correct expiration    ✓
├─ Validates tokens properly                ✓
├─ Checks single session enforcement        ✓
├─ Revokes old tokens on new login          ✓
└─ Cleans up expired tokens                 ✗ (needed)

FRONTEND
│
├─ Receives tokens securely in cookies      ✓
├─ Updates tokens on refresh                ✗ Fix #3
├─ Auto-refreshes before expiration         ✗ (needed)
├─ Handles refresh failure gracefully       ✗ (needed)
└─ Redirects to login when refresh fails    ✗ (needed)
```

---

## 🔧 What Each Fix Does

### Fix #1: Backend Returns Refresh Token from Service

```typescript
// BEFORE (Incomplete)
const refreshAccessToken = async (refreshToken: string) => {
  // ... validation ...
  
  return {
    employee: {...},
    accessToken: newAccessToken,
    // ❌ refreshToken is missing!
    // Frontend doesn't know if it changed
    // Frontend can't update its cookie
  };
};

// AFTER (Complete)
const refreshAccessToken = async (refreshToken: string) => {
  // ... validation ...
  
  return {
    employee: {...},
    accessToken: newAccessToken,
    refreshToken: refreshToken,  // ← Send it back
    // ✅ Frontend knows what to store in cookies
  };
};
```

**Impact:** Frontend can now maintain correct refresh_token cookie

---

### Fix #2: Controller Passes Token to Frontend

```typescript
// BEFORE (Incomplete Pass-Through)
res.status(200).json({
  success: true,
  accessToken: result.accessToken,
  employee: result.employee,
  // ❌ result.refreshToken exists but not sent to client!
});

// AFTER (Complete Pass-Through)
res.status(200).json({
  success: true,
  accessToken: result.accessToken,
  refreshToken: result.refreshToken,  // ← Now send it
  employee: result.employee,
  // ✅ Frontend receives both tokens
});
```

**Impact:** Frontend receives the refresh token to update its cookie

---

### Fix #3: Frontend Route Handles Missing Token

```typescript
// BEFORE (Assumes token always comes back)
const response = NextResponse.json({
  success: true,
  accessToken: data.accessToken,
  refreshToken: data.refreshToken  // ← Assumes defined
}, { status: 200 });

response.cookies.set("refresh_token", data.refreshToken, {...});
// ❌ If data.refreshToken is undefined, cookie becomes invalid!

// AFTER (Handles both cases)
const cookieStore = await cookies();
const existingRefreshToken = cookieStore.get("refresh_token")?.value;

// ... call backend ...

const tokenToUse = 
  data.refreshToken ||           // Use new if provided
  existingRefreshToken;           // Otherwise keep existing

response.cookies.set("refresh_token", tokenToUse, {...});
// ✅ Cookie always has a valid token
```

**Impact:** Frontend cookie stays valid even if backend forgets to return token

---

## 📈 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    LOGIN REQUEST                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  FRONTEND                                                    │
│   └─ User submits login form                                │
│     ├─ Email: test@example.com                             │
│     └─ Password: ••••••••                                   │
│                  │                                           │
│                  ├─ [Data Validation]                       │
│                  │  ├─ Email format valid?                  │
│                  │  └─ Password not empty?                  │
│                  │                                           │
│                  ▼                                           │
│  FRONTEND NEXT.JS ROUTE                                     │
│  /api/auth/login                                            │
│  ├─ POST to backend /api/v1/employees/login                │
│  │  ├─ Body: {email, password}                             │
│  │  └─ Headers: Content-Type: application/json             │
│  │                                                          │
│  │  ▼                                                       │
│  │  BACKEND API (Express)                                  │
│  │  POST /api/v1/employees/login                           │
│  │  ├─ [Validation]                                        │
│  │  │  ├─ Email required?                                  │
│  │  │  ├─ Password required?                               │
│  │  │  └─ Email format valid?                              │
│  │  │                                                       │
│  │  ├─ [Check Existing Session]                            │
│  │  │  └─ canEmployeeLogin()                               │
│  │  │     ├─ Check for active refresh tokens               │
│  │  │     ├─ revokedAt IS NULL                             │
│  │  │     ├─ expiresAt > NOW()                             │
│  │  │     └─ Count > 0? → Reject login                     │
│  │  │                                                       │
│  │  ├─ [Password Verification]                             │
│  │  │  ├─ Find employee by email                           │
│  │  │  ├─ Compare password with hash                       │
│  │  │  └─ Valid? → Continue, Invalid? → Reject            │
│  │  │                                                       │
│  │  ├─ [Revoke Old Tokens]                                 │
│  │  │  └─ UPDATE RefreshToken                              │
│  │  │     WHERE employeeId = X                             │
│  │  │     SET revokedAt = NOW()                            │
│  │  │                                                       │
│  │  ├─ [Generate New Tokens]                               │
│  │  │  ├─ generateAccessToken()                            │
│  │  │  │  ├─ JWT: { id, email, type: "access" }           │
│  │  │  │  └─ Expires: 15 minutes                           │
│  │  │  ├─ generateRefreshToken()                           │
│  │  │  │  ├─ JWT: { id, email, type: "refresh" }          │
│  │  │  │  └─ Expires: 7 days                               │
│  │  │  └─ Token payload: {id, email, type}                │
│  │  │                                                       │
│  │  ├─ [Store Refresh Token]                               │
│  │  │  └─ INSERT INTO RefreshToken                         │
│  │  │     ├─ token: <actual_jwt_token>                     │
│  │  │     ├─ employeeId: <user_id>                         │
│  │  │     ├─ expiresAt: NOW() + 7 days                     │
│  │  │     └─ revokedAt: NULL                               │
│  │  │                                                       │
│  │  └─ [Return Response]  ← FIX #1 & #2 NEEDED HERE        │
│  │     200 OK {                                            │
│  │       success: true,                                    │
│  │       employee: {id, email, name},                      │
│  │       accessToken: "eyJhbGc...",                        │
│  │       refreshToken: "eyJhbGc..." ← MUST INCLUDE         │
│  │     }                                                    │
│  │                                                          │
│  ├─ Receive response                                        │
│  │  ├─ Status 200?                                         │
│  │  ├─ Has accessToken?                                    │
│  │  └─ Has refreshToken?                                   │
│  │                                                          │
│  └─ Set cookies ← FIX #3 NEEDED HERE                        │
│     ├─ access_token: <accessToken>                         │
│     │  ├─ httpOnly: true (no JS access)                    │
│     │  ├─ maxAge: 15 minutes                               │
│     │  └─ sameSite: strict                                 │
│     │                                                       │
│     ├─ refresh_token: <refreshToken>                       │
│     │  ├─ httpOnly: true                                   │
│     │  ├─ maxAge: 7 days                                   │
│     │  └─ sameSite: strict                                 │
│     │                                                       │
│     ├─ Update Auth State                                    │
│     │  ├─ isAuthenticated = true                           │
│     │  ├─ user = {id, email, name}                         │
│     │  └─ Schedule token refresh (FUTURE)                  │
│     │                                                       │
│     └─ Redirect to dashboard                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧪 Testing the Fix

### Test Case 1: Verify Refresh Returns Token
```
Expected: Backend returns refreshToken in response
Verify: POST /refresh includes refreshToken field
```

### Test Case 2: Verify Cookie Updates
```
Expected: Frontend updates refresh_token cookie
Verify: Cookie value changes after refresh
```

### Test Case 3: Verify Login After Expiration
```
Expected: Can login when access token expired
Verify: Login succeeds without "already logged in" error
```

### Test Case 4: Verify Database State
```
Expected: Only 1 active token per employee
Verify: 
  SELECT COUNT(*) FROM RefreshToken 
  WHERE employeeId = X AND revokedAt IS NULL AND expiresAt > NOW()
  Result should be 0 or 1
```

---

## 🚀 Implementation Priority

| # | Fix | Time | Impact | Difficulty |
|---|-----|------|--------|------------|
| 1 | Backend return refresh token | 2 min | HIGH | Easy ✓ |
| 2 | Controller pass through token | 2 min | HIGH | Easy ✓ |
| 3 | Frontend handle fallback | 5 min | MEDIUM | Medium |
| 4 | Auto-refresh hook | 30 min | HIGH | Hard |
| 5 | Token cleanup job | 15 min | MEDIUM | Medium |
| 6 | Error interceptor | 20 min | HIGH | Hard |

**Critical Path:** Fix 1 + 2 + 3 (9 minutes) solves the main issue

---

## ✅ Success Criteria

After implementing all fixes:

- [ ] User can login immediately after token expiration
- [ ] No "already logged in" error on fresh login
- [ ] Refresh token returned from backend
- [ ] Frontend cookie updates properly
- [ ] Single session enforced correctly
- [ ] Database cleanup job runs daily
- [ ] Automatic token refresh before expiration
- [ ] Failed requests retry with fresh token
- [ ] All error messages are clear

---

## 📌 Key Takeaways

1. **The core problem** isn't in the logic, it's in missing data flow
2. **The backend is correct** - it validates tokens properly
3. **The issue is** - backend doesn't return refresh token, so frontend keeps old one
4. When old token is still valid, next login attempt fails with "already logged in"
5. **The fix is simple** - just 3 small changes to complete the data flow

---
