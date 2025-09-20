import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const user = body?.record ?? body?.new ?? body?.user;
  if (!user?.id) return NextResponse.json({ ok: false }, { status: 400 });

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE!
  );
  
  const profile = {
    id: user.id,
    email: user.email,
    display_name: user.user_metadata?.display_name ?? user.email?.split('@')[0] ?? null,
    photo_url: user.user_metadata?.avatar_url ?? null
  };

  const { error } = await admin.from('profiles').upsert(profile);
  
  if (error) {
    console.error('Error upserting profile:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ ok: true });
}