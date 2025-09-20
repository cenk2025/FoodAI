import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';

function verifySig(raw: string, sig: string, secret: string) {
  const h = crypto.createHmac('sha256', secret).update(raw).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(h), Buffer.from(sig));
}

export async function POST(req: NextRequest) {
  const secret = process.env.COMMISSIONS_WEBHOOK_SECRET || '';
  const sig = req.headers.get('x-signature') || '';
  const raw = await req.text();
  if (!secret || !sig || !verifySig(raw, sig, secret))
    return NextResponse.json({ ok:false, error:'bad signature' }, { status: 401 });

  const body = JSON.parse(raw);
  // expected: { provider_slug, conversion_id, clickout_id?, offer_id?, gross_amount, commission_amount, currency, status, occurred_at }
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!);

  const { data: provider } = await admin.from('providers').select('id').eq('slug', body.provider_slug).single();
  if (!provider) return NextResponse.json({ ok:false, error:'provider not found' }, { status: 400 });

  const rec = {
    provider_id: provider.id,
    external_conversion_id: String(body.conversion_id),
    clickout_id: body.clickout_id ?? null,
    offer_id: body.offer_id ?? null,
    gross_amount: Number(body.gross_amount || 0),
    commission_amount: Number(body.commission_amount || 0),
    currency: body.currency || 'EUR',
    status: (body.status || 'pending') as 'pending'|'approved'|'canceled',
    occurred_at: body.occurred_at ? new Date(body.occurred_at).toISOString() : null
  };

  const { error } = await admin.from('commissions').upsert(rec, { onConflict: 'provider_id,external_conversion_id' });
  if (error) return NextResponse.json({ ok:false, error: error.message }, { status:500 });
  return NextResponse.json({ ok:true });
}