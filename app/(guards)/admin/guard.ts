import { createSupabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Database } from '@/types/supabase';

/**
 * Asserts that the current user is authenticated and has admin privileges.
 * Redirects to signin page if not authenticated, or to dashboard if not admin.
 */
export async function assertAdmin() {
  const s = createSupabaseServer();
  const { data: { user } } = await s.auth.getUser();
  
  if (!user) {
    redirect('/auth/signin');
  }
  
  const { data: me, error } = await s.from('profiles').select('is_admin').eq('id', user.id).single<Database['public']['Tables']['profiles']['Row']>();
  
  if (error || !me?.is_admin) {
    redirect('/dashboard');
  }
}