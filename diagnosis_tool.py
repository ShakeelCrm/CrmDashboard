#!/usr/bin/env python3
"""
Token Implementation Diagnostic Tool
Helps identify issues with token creation and management
"""

import json
from datetime import datetime, timedelta

class TokenDiagnostics:
    """Diagnostic checks for token implementation"""
    
    @staticmethod
    def analyze_refresh_token_record(token_record: dict) -> dict:
        """Analyze a refresh token record from the database"""
        now = datetime.now()
        expires_at = token_record.get("expiresAt")
        revoked_at = token_record.get("revokedAt")
        
        # Parse datetime if it's a string
        if isinstance(expires_at, str):
            expires_at = datetime.fromisoformat(expires_at.replace('Z', '+00:00'))
        if isinstance(revoked_at, str):
            revoked_at = datetime.fromisoformat(revoked_at.replace('Z', '+00:00'))
        
        is_expired = expires_at < now if expires_at else True
        is_revoked = revoked_at is not None
        is_active = (not is_revoked) and (not is_expired)
        
        return {
            "token_id": token_record.get("id"),
            "employee_id": token_record.get("employeeId"),
            "expires_at": expires_at,
            "revoked_at": revoked_at,
            "is_expired": is_expired,
            "is_revoked": is_revoked,
            "is_active": is_active,
            "status": "ACTIVE" if is_active else ("REVOKED" if is_revoked else "EXPIRED"),
            "days_until_expiration": round((expires_at - now).total_seconds() / 86400) if expires_at else -1,
        }
    
    @staticmethod
    def check_single_session_logic(tokens: list) -> dict:
        """Check if single session enforcement would work correctly"""
        active_tokens = [t for t in tokens if t.get("is_active")]
        revoked_tokens = [t for t in tokens if t.get("is_revoked")]
        expired_tokens = [t for t in tokens if t.get("is_expired")]
        
        return {
            "total_tokens": len(tokens),
            "active_tokens": len(active_tokens),
            "revoked_tokens": len(revoked_tokens),
            "expired_tokens": len(expired_tokens),
            "can_user_login": len(active_tokens) == 0,
            "should_allow_login": True if len(active_tokens) == 0 else False,
            "issues": [
                "Multiple active tokens found - should only have 1" if len(active_tokens) > 1 else None,
                "Expired tokens not cleaned up" if len(expired_tokens) > 0 else None,
                "All tokens expired/revoked - user should be able to login" if len(active_tokens) == 0 else None,
            ]
        }
    
    @staticmethod
    def simulate_login_flow(employee_id: int, existing_tokens: list) -> dict:
        """Simulate what happens during a login request"""
        print(f"\n{'='*60}")
        print(f"SIMULATING LOGIN FOR EMPLOYEE {employee_id}")
        print(f"{'='*60}")
        
        # Check existing tokens
        print(f"\n1. Checking for existing active sessions...")
        analysis = TokenDiagnostics.check_single_session_logic(existing_tokens)
        print(f"   - Total tokens in database: {analysis['total_tokens']}")
        print(f"   - Active tokens: {analysis['active_tokens']}")
        print(f"   - Revoked tokens: {analysis['revoked_tokens']}")
        print(f"   - Expired tokens: {analysis['expired_tokens']}")
        
        # Decision
        print(f"\n2. Should allow login?")
        if analysis['can_user_login']:
            print(f"   ✅ YES - No active sessions found")
            print(f"   Action: ALLOW LOGIN")
        else:
            print(f"   ❌ NO - Active session found")
            print(f"   Action: REJECT LOGIN with 'Already logged in' error")
            if analysis['active_tokens'] > 0:
                print(f"   \n   PROBLEM DETECTED:")
                print(f"   - User expects to login but gets 'already logged in' error")
                print(f"   - This happens when access token expired but refresh token is still valid")
                print(f"   - SOLUTION: Check if access token in request is expired")
                print(f"              If expired, allow login (don't use refresh token)")
        
        return analysis
    
    @staticmethod
    def check_database_health() -> dict:
        """Recommendations for database health check"""
        return {
            "check_1": {
                "name": "Verify expiresAt is set on all tokens",
                "sql": "SELECT COUNT(*) FROM \"RefreshToken\" WHERE \"expiresAt\" IS NULL;",
                "expected": "Result should be 0",
                "issue_if_not": "Tokens without expiration date can't be validated properly"
            },
            "check_2": {
                "name": "Find expired but not-revoked tokens",
                "sql": "SELECT * FROM \"RefreshToken\" WHERE \"expiresAt\" < NOW() AND \"revokedAt\" IS NULL;",
                "expected": "Result should be empty (or run cleanup)",
                "issue_if_not": "Old tokens accumulating in database"
            },
            "check_3": {
                "name": "Count active sessions per employee",
                "sql": """
                SELECT "employeeId", COUNT(*) as active_count
                FROM "RefreshToken"
                WHERE "revokedAt" IS NULL AND "expiresAt" > NOW()
                GROUP BY "employeeId"
                HAVING COUNT(*) > 1;
                """,
                "expected": "Result should be empty",
                "issue_if_not": "Some employees have multiple active sessions (single-session violation)"
            },
            "check_4": {
                "name": "Verify token creation aligns with login",
                "sql": """
                SELECT e.id, e.email, COUNT(rt.id) as token_count,
                       MAX(rt."createdAt") as last_login
                FROM "Employee" e
                LEFT JOIN "RefreshToken" rt ON e.id = rt."employeeId"
                WHERE rt."revokedAt" IS NULL AND rt."expiresAt" > NOW()
                GROUP BY e.id
                """,
                "expected": "Each employee should have 1 active token",
                "issue_if_not": "Session management not working correctly"
            }
        }

# Example usage
if __name__ == "__main__":
    print("TOKEN IMPLEMENTATION DIAGNOSTIC TOOL")
    print("=" * 60)
    print("\nTo use this tool:")
    print("1. Export your refresh tokens from the database")
    print("2. Run the checks defined in check_database_health()")
    print("3. Use the analyze_refresh_token_record() for each token")
    print("4. Use simulate_login_flow() to see what would happen")
    
    # Example with sample data
    print("\n\n" + "=" * 60)
    print("EXAMPLE ANALYSIS")
    print("=" * 60)
    
    sample_tokens = [
        {
            "id": 1,
            "employeeId": 5,
            "expiresAt": (datetime.now() - timedelta(days=8)).isoformat(),
            "revokedAt": None,  # NOT revoked, but EXPIRED
        },
        {
            "id": 2,
            "employeeId": 5,
            "expiresAt": (datetime.now() + timedelta(days=2)).isoformat(),
            "revokedAt": None,  # ACTIVE
        }
    ]
    
    print("\nAnalyzing sample tokens for Employee ID 5:")
    for token in sample_tokens:
        analysis = TokenDiagnostics.analyze_refresh_token_record(token)
        print(f"\nToken {token['id']}:")
        print(f"  Status: {analysis['status']}")
        print(f"  Expires: {analysis['expires_at']}")
        print(f"  Days until expiry: {analysis['days_until_expiration']}")
    
    # Simulate login
    analysis = TokenDiagnostics.simulate_login_flow(5, sample_tokens)
    
    print("\n" + "=" * 60)
    print("DATABASE HEALTH CHECKS")
    print("=" * 60)
    checks = TokenDiagnostics.check_database_health()
    for check_name, check_data in checks.items():
        print(f"\n{check_name}: {check_data['name']}")
        print(f"SQL: {check_data['sql'].strip()}")
        print(f"Expected: {check_data['expected']}")
        print(f"If not: {check_data['issue_if_not']}")
