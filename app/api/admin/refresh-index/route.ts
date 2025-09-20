import { NextRequest } from 'next/server';

// Declare the module since we can't resolve the types
declare const require: any;
const { createClient } = require('@supabase/supabase-js');
import { Database } from '@/types/supabase';

// Declare process for TypeScript
declare const process: {
  env: {
    CRON_TOKEN: string;
    NEXT_PUBLIC_SUPABASE_URL: string;
    SUPABASE_SERVICE_ROLE: string;
  };
};

export async function POST(req: Request) {
  const token = req.headers.get('x-cron-token');
  if (token !== process.env.CRON_TOKEN) return new Response('Unauthorized', {status: 401});
  
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE!
  );
  
  // Use the existing RPC function to refresh the materialized view
  const { error } = await (admin as any).rpc('refresh_materialized_view', { view_name: 'offer_index' });
  
  if (error) {
    console.error('Error refreshing materialized view:', error);
    return new Response('Error refreshing index', { status: 500 });
  }
  
  return new Response('ok');
}