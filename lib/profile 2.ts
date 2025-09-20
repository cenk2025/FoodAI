import {createSupabaseServer} from '@/lib/supabase/server';
import type { Database } from '@/types/supabase';

// Export the Profile type from the database schema
export type Profile = Database['public']['Tables']['profiles']['Row'];

type AuthUserLike = {
  id: string;
  email?: string | null;
  user_metadata?: {
    name?: string | null;
    full_name?: string | null;
    picture?: string | null;
    avatar_url?: string | null;
  };
};

export async function upsertProfile(user: AuthUserLike) {
  const sb = createSupabaseServer();

  const row = {
    id: user.id,
    email: user.email ?? null,
    display_name:
      user.user_metadata?.name ??
      user.user_metadata?.full_name ??
      null,
    photo_url:
      user.user_metadata?.avatar_url ??
      user.user_metadata?.picture ??
      null,
  };

  // Supabase v2: upsert with any typing to avoid conflicts
  const {error} = await sb.from('profiles').upsert(row as any, {
    onConflict: 'id',
    ignoreDuplicates: false,
  });

  if (error) throw error;
  return row;
}