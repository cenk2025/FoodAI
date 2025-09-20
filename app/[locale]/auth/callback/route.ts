import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Declare process for TypeScript
declare const process: {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  };
};

// Declare require for dynamic imports
declare const require: any;

export async function GET(req: Request, { params }: { params: { locale: string } }) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next');

  if (code) {
    const cookieStore = await cookies();
    
    const { createServerClient } = require('@supabase/ssr');
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set(name, value, options);
          },
          remove(name: string, options: any) {
            cookieStore.delete({ name, ...options });
          }
        }
      }
    );
    await supabase.auth.exchangeCodeForSession(code);
  }

  const to = next?.startsWith('/') ? next : `/${params.locale}/`;
  return NextResponse.redirect(new URL(to, origin));
}