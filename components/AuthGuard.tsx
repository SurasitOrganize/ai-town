"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getSession, onAuthStateChange } from '@/lib/supabase/auth';
import { isSupabaseConfigured } from '@/lib/supabase/client';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // If Supabase is not configured, allow access
    if (!isSupabaseConfigured()) {
      setIsLoading(false);
      setIsAuthenticated(true);
      return;
    }

    // Check initial session
    const checkSession = async () => {
      const session = await getSession();
      const authenticated = !!session;
      
      setIsAuthenticated(authenticated);
      setIsLoading(false);

      // Redirect to login if not authenticated and not already on login page
      if (!authenticated && pathname !== '/login') {
        router.push('/login');
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange((session) => {
      const authenticated = !!session;
      setIsAuthenticated(authenticated);

      if (!authenticated && pathname !== '/login') {
        router.push('/login');
      } else if (authenticated && pathname === '/login') {
        router.push('/');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  // Allow login page to render even when not authenticated
  if (pathname === '/login') {
    return <>{children}</>;
  }

  // For all other pages, only render if authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
