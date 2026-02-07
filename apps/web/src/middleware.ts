import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  // Check if user is trying to access protected routes (everything except auth pages)
  const isAuthRoute = 
    request.nextUrl.pathname.startsWith('/login') || 
    request.nextUrl.pathname.startsWith('/signup');
  
  // Only apply middleware to application routes, not static assets or API routes
  const isAppRoute = 
    !request.nextUrl.pathname.startsWith('/api') &&
    !request.nextUrl.pathname.startsWith('/_next') &&
    !request.nextUrl.pathname.includes('.') && // Exclude files with extensions
    request.nextUrl.pathname !== '/favicon.ico';

  if (isAppRoute) {
    if (isAuthRoute) {
      // If user is already authenticated and tries to access login/signup, redirect to dashboard
      const accessToken = request.cookies.get('access_token')?.value;
      
      if (accessToken) {
        try {
          const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
          const res = await fetch(`${BACKEND_URL}/api/v1/employees/profile`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          });

          if (res.ok) {
            // User is authenticated, redirect to dashboard (root)
            if (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup') {
              return NextResponse.redirect(new URL('/', request.url));
            }
          }
        } catch (error) {
          // If there's an error validating the token, allow access to login
        }
      }
    } else {
      // For non-auth routes, check if user is authenticated
      const isProtectedRoute = 
        request.nextUrl.pathname !== '/' && 
        !request.nextUrl.pathname.startsWith('/login') &&
        !request.nextUrl.pathname.startsWith('/signup');

      if (isProtectedRoute) {
        const accessToken = request.cookies.get('access_token')?.value;
        
        if (!accessToken) {
          // Redirect to login if not authenticated
          const requestedPage = request.nextUrl.pathname;
          const redirectUrl = `/login?callbackUrl=${encodeURIComponent(requestedPage)}`;
          return NextResponse.redirect(new URL(redirectUrl, request.url));
        }

        // Optionally, validate the token with your backend
        try {
          const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
          const res = await fetch(`${BACKEND_URL}/api/v1/employees/profile`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          });

          if (!res.ok) {
            // If token is invalid, redirect to login
            const requestedPage = request.nextUrl.pathname;
            const redirectUrl = `/login?callbackUrl=${encodeURIComponent(requestedPage)}`;
            return NextResponse.redirect(new URL(redirectUrl, request.url));
          }
        } catch (error) {
          // If there's an error validating the token, redirect to login
          const requestedPage = request.nextUrl.pathname;
          const redirectUrl = `/login?callbackUrl=${encodeURIComponent(requestedPage)}`;
          return NextResponse.redirect(new URL(redirectUrl, request.url));
        }
      }
    }
  }

  return NextResponse.next();
}

// Specify which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all routes except:
     * - API routes
     * - Static assets
     * - Files with extensions (like .svg, .png, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};