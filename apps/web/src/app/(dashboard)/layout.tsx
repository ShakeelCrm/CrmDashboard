'use client';

import { useAuth } from '@/lib/auth-context';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/header';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If user is not authenticated and session is not loading, redirect to login
    if (!isLoading && status !== 'loading') {
      if (!isAuthenticated || status !== 'authenticated') {
        // Redirect to login, preserving the attempted route
        router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
      }
    }
  }, [isAuthenticated, isLoading, status, router, pathname]);

  // Show loading state while checking authentication
  if (isLoading || status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Checking authentication status...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If not authenticated, don't render children (redirect effect happens in useEffect)
  if (!isAuthenticated || status !== 'authenticated') {
    return null;
  }

  // Render the protected content
  return <>{children}</>;
}