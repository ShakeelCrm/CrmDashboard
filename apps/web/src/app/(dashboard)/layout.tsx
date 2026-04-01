'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar";
import { Header } from '@/components/header';
import { data } from '@/lib/sidebar';
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If user is not authenticated, redirect to login
    if (!isLoading && !isAuthenticated) {
      // Redirect to login, preserving the attempted route
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  // Show loading state while checking authentication
  if (isLoading) {
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
  if (!isAuthenticated) {
    return null;
  }

  // Function to find the page title based on the current pathname
  const getPageTitle = (currentPathname: string) => {
    // Check if we're on the main dashboard page
    if (currentPathname === '/(dashboard)' || currentPathname === '/' || currentPathname === '') {
      return 'Dashboard';
    }

    // Iterate through the navigation items to find a match
    for (const section of data.navMain) {
      // Check if the current pathname matches the section's URL
      if (currentPathname.includes(section.url)) {
        // If there are sub-items, check for a more specific match
        if (section.items && section.items.length > 0) {
          for (const item of section.items) {
            if (currentPathname.includes(item.url)) {
              return item.pageTitle || item.title;
            }
          }
        }
        // If no specific sub-item matched, return the section's page title
        return section.pageTitle || section.title;
      }
    }

    // Default to Dashboard if no specific route matches
    return 'Dashboard';
  };

  const pageTitle = getPageTitle(pathname);

  return (
    <SidebarProvider className=''>
      <AppSidebar />
      <main className="w-screen">
        <Header title={pageTitle} />

        {children}
      </main>
    </SidebarProvider>
  )
}