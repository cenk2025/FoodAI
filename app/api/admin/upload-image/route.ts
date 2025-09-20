import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get('file') as File | null;
  if (!file) return NextResponse.json({ ok:false, error:'No file' }, { status:400 });

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const key = `offers/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!);
  const { error } = await admin.storage.from('offer-images').upload(key, file, {
    cacheControl: '3600', upsert: false, contentType: file.type || 'image/jpeg'
  });
  if (error) return NextResponse.json({ ok:false, error: error.message }, { status:500 });

  const { data: pub } = admin.storage.from('offer-images').getPublicUrl(key);
  return NextResponse.json({ ok:true, url: pub.publicUrl });
}