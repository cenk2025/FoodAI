// app/api/supabase-test/route.ts
import { createSupabaseBrowser } from '@/lib/supabase/browser';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // This will run on the server side, so it won't use the browser client
    // But we can still test if the environment variables are accessible
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    return NextResponse.json({
      supabaseUrl,
      supabaseKey: supabaseKey ? `${supabaseKey.substring(0, 20)}...` : undefined,
      message: "Environment variables loaded successfully"
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      message: "Failed to load environment variables"
    }, { status: 500 });
  }
}