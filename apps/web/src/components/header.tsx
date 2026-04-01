'use client';

import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SidebarTrigger } from './ui/sidebar';

type HeaderProps = {
  title?: string;
};

export function Header({ title = "Employee Portal" }: HeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between px-4">

        <div className="flex items-center gap-2">
      <SidebarTrigger />
          <h1 className="text-xl font-bold">{title}</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right mr-4">
            <p className="text-sm font-medium">{user?.name || user?.email?.split('@')[0]}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}