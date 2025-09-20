import { NextResponse } from 'next/server';

export async function GET() {
  // Server-side environment variables (all variables)
  const serverEnv = {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE: process.env.SUPABASE_SERVICE_ROLE,
    DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
    NEXT_PUBLIC_GOOGLE_ENABLED: process.env.NEXT_PUBLIC_GOOGLE_ENABLED,
  };

  // Check URL validity
  let urlValid = false;
  let urlError = '';
  try {
    if (serverEnv.NEXT_PUBLIC_SUPABASE_URL) {
      new URL(serverEnv.NEXT_PUBLIC_SUPABASE_URL);
      urlValid = true;
    }
  } catch (e) {
    urlError = e instanceof Error ? e.message : 'Unknown error';
  }

  // Check for placeholder values
  const containsYour = 
    (serverEnv.NEXT_PUBLIC_SUPABASE_URL && serverEnv.NEXT_PUBLIC_SUPABASE_URL.includes('your-')) ||
    (serverEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY && serverEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('your-'));

  return NextResponse.json({
    serverEnv,
    urlValid,
    urlError,
    containsYour,
  });
}