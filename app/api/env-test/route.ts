// app/api/env-test/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  let urlValid = false;
  let urlError = '';
  
  try {
    if (supabaseUrl) {
      new URL(supabaseUrl);
      urlValid = true;
    }
  } catch (e) {
    urlError = e instanceof Error ? e.message : 'Unknown error';
  }
  
  return NextResponse.json({
    supabaseUrl,
    supabaseKey: supabaseKey ? `${supabaseKey.substring(0, 20)}...` : undefined,
    urlValid,
    urlError,
  });
}