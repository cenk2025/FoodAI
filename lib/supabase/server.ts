import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

export function createSupabaseServer() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  // IMPORTANT: server-side key; never exposed to client
  let supabaseKey = process.env.SUPABASE_SERVICE_ROLE ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  // Fallback to anon key if service role key is a placeholder
  if (supabaseKey === 'your_actual_service_role_key_here') {
    supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  }
  
  return createClient<Database>(supabaseUrl, supabaseKey, {
    global: { 
      headers: { 
        'X-Forwarded-Host': headers().get('host') ?? '' 
      } 
    },
    auth: { 
      persistSession: false, 
      autoRefreshToken: false, 
      detectSessionInUrl: false 
    }
  });
}