'use client';

import { useEffect } from 'react';
import { AuthProvider } from '@/lib/auth-context';
import { setupApiInterceptor } from '@/lib/api-interceptor';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Setup API interceptor for 401/403 error handling
    setupApiInterceptor();
  }, []);

  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}