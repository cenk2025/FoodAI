import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const payload = {
    provider_id: form.get('provider_id') as string,
    title: String(form.get('title') || '').slice(0, 200),
    original_price: Number(form.get('original_price') || 0) || null,
    discounted_price: Number(form.get('discounted_price') || 0),
    city: String(form.get('city') || '').slice(0, 80) || null,
    deep_link: String(form.get('deep_link') || '').slice(0, 1024) || null,
    image_url: String(form.get('image_url') || '').slice(0, 1024) || null,
    status: 'active'
  };

  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!);
  const { error } = await admin.from('offers').insert(payload);
  if (error) return NextResponse.json({ ok:false, error: error.message }, { status:500 });
  return NextResponse.redirect(new URL('/admin', process.env.NEXT_PUBLIC_SITE_URL), 302);
}