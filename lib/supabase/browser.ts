import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';

// Create a mock client that supports method chaining
function createMockClient() {
  const mockQuery = {
    select: () => mockQuery,
    insert: () => mockQuery,
    update: () => mockQuery,
    delete: () => mockQuery,
    order: () => mockQuery,
    eq: () => mockQuery,
    neq: () => mockQuery,
    gt: () => mockQuery,
    lt: () => mockQuery,
    gte: () => mockQuery,
    lte: () => mockQuery,
    like: () => mockQuery,
    ilike: () => mockQuery,
    in: () => mockQuery,
    contains: () => mockQuery,
    range: () => mockQuery,
    single: () => mockQuery,
    limit: () => mockQuery,
    offset: () => mockQuery,
    then: () => Promise.resolve({ data: null, error: null }),
  };

  return {
    from: () => mockQuery,
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signInWithOAuth: () => Promise.resolve({ data: { provider: '', url: '' }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      signUp: () => Promise.resolve({ data: { user: null, session: null }, error: null }),
      signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: null }),
    },
    rpc: () => mockQuery,
  } as any;
}

export function createSupabaseBrowser() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  console.log('=== Supabase Browser Client Initialization ===');
  console.log('supabaseUrl:', supabaseUrl);
  console.log('supabaseKey:', supabaseKey ? `${supabaseKey.substring(0, 10)}...` : undefined);
  console.log('supabaseUrl type:', typeof supabaseUrl);
  console.log('supabaseKey type:', typeof supabaseKey);
  
  // Check if the required environment variables are set
  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase credentials are missing. Returning a mock client.');
    return createMockClient();
  }
  
  // Validate the URL format
  try {
    new URL(supabaseUrl);
    console.log('URL validation passed');
  } catch (e) {
    console.warn('Invalid Supabase URL format. Returning a mock client.', e);
    return createMockClient();
  }
  
  // Check if the URL or key are placeholders
  const isPlaceholder = supabaseUrl.includes('your-') || supabaseKey.includes('your-');
  console.log('Is placeholder:', isPlaceholder);
  console.log('supabaseUrl includes "your-":', supabaseUrl.includes('your-'));
  console.log('supabaseKey includes "your-":', supabaseKey.includes('your-'));
  
  if (isPlaceholder) {
    console.warn('Supabase credentials are placeholders. Returning a mock client.');
    return createMockClient();
  }
  
  console.log('Creating real Supabase client with URL:', supabaseUrl);
  
  return createBrowserClient<Database>(
    supabaseUrl,
    supabaseKey
  );
}