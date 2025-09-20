import { NextResponse } from 'next/server';

export async function GET() {
  const envVars = {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_GOOGLE_ENABLED: process.env.NEXT_PUBLIC_GOOGLE_ENABLED,
  };

  // Check if variables exist and are valid
  const hasUrl = !!envVars.NEXT_PUBLIC_SUPABASE_URL;
  const hasKey = !!envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isUrlValid = hasUrl ? (() => {
    try {
      new URL(envVars.NEXT_PUBLIC_SUPABASE_URL!);
      return true;
    } catch {
      return false;
    }
  })() : false;

  const isPlaceholder = (hasUrl && envVars.NEXT_PUBLIC_SUPABASE_URL!.includes('your-')) || 
                       (hasKey && envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY!.includes('your-'));

  return NextResponse.json({
    envVars,
    hasUrl,
    hasKey,
    isUrlValid,
    isPlaceholder,
    analysis: {
      urlCheck: hasUrl ? envVars.NEXT_PUBLIC_SUPABASE_URL!.substring(0, 50) + '...' : 'undefined',
      keyCheck: hasKey ? envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY!.substring(0, 20) + '...' : 'undefined',
    }
  });
}