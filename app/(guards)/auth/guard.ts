import { createSupabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

/**
 * Asserts that the current user is authenticated.
 * Redirects to signin page if not authenticated.
 */
export async function assertAuth() {
  const s = createSupabaseServer();
  const { data: { user } } = await s.auth.getUser();
  
  if (!user) {
    redirect('/auth/signin');
  }
}