"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from '@/lib/supabase/auth';
import { isSupabaseConfigured } from '@/lib/supabase/client';

export function SignOutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  if (!isSupabaseConfigured()) {
    return null;
  }

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Sign out error:', error);
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={isLoading}
      className="w-full text-left text-white hover:bg-gray-700 py-2 px-3 rounded text-sm transition-colors disabled:opacity-50"
    >
      {isLoading ? '🔄 Signing out...' : '🚪 Sign Out'}
    </button>
  );
}
