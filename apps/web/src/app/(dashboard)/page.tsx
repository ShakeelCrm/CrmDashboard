'use client';

import { Header } from '@/components/header';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { logout } from '@/lib/auth-service';
import { useSession } from 'next-auth/react';

export default function DashboardPage() {
  const { user, logout: contextLogout } = useAuth();
  const { data: session } = useSession();

  const handleLogout = async () => {
    await contextLogout();
  };

  return (
    <>
      <Header />
      <main className="container mx-auto py-6">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Employee Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Welcome, {user?.name || session?.user?.name}!</h3>
                <p className="text-muted-foreground">
                  You are successfully logged in as an employee.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium">Employee Information</h4>
                  <p className="text-sm text-muted-foreground mt-1">ID: {user?.id || session?.user?.id}</p>
                  <p className="text-sm text-muted-foreground">Email: {user?.email || session?.user?.email}</p>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium">Actions</h4>
                  <div className="mt-2 space-x-2">
                    <Button variant="outline" onClick={handleLogout}>
                      Logout
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}