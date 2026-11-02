import { supabase, isSupabaseConfigured } from './client';

export async function signInAnonymously() {
  if (!isSupabaseConfigured() || !supabase) {
    console.warn('Supabase not configured, skipping authentication');
    return { error: null, session: null };
  }

  try {
    const { data, error } = await supabase.auth.signInAnonymously();
    
    if (error) {
      console.error('Anonymous sign-in error:', error);
      return { error, session: null };
    }

    return { error: null, session: data.session };
  } catch (err) {
    console.error('Anonymous sign-in exception:', err);
    return { error: err as Error, session: null };
  }
}

export async function getSession() {
  if (!isSupabaseConfigured() || !supabase) {
    return null;
  }

  try {
    const { data } = await supabase.auth.getSession();
    return data.session;
  } catch (err) {
    console.error('Get session error:', err);
    return null;
  }
}

export function onAuthStateChange(callback: (session: any) => void) {
  if (!isSupabaseConfigured() || !supabase) {
    return { data: { subscription: { unsubscribe: () => {} } } };
  }

  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
}
