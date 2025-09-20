import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { allowIp } from '@/lib/rate-limit';

const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions';

export async function POST(req: NextRequest) {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) return NextResponse.json({ ok: false, error: 'DEEPSEEK_API_KEY missing' }, { status: 401 });

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '0.0.0.0';
  if (!allowIp(ip)) return NextResponse.json({ ok: false, error: 'Rate limit' }, { status: 429 });

  try {
    const body = await req.json();
    const query = String(body?.q || '').slice(0, 200);
    const city = body?.city as string | undefined;

    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE) {
      return NextResponse.json({ ok: false, error: 'Missing Supabase environment variables' }, { status: 500 });
    }

    const db = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE!
    );

    let q = db.from('offer_index').select('*').order('discount_percent', { ascending: false }).limit(8);
    if (query) q = q.ilike('title', `%${query}%`);
    if (city) q = q.eq('city', city);
    const { data: offers, error } = await q;

    if (error) {
      // Avoid logging secrets
      console.error('Supabase error');
      return NextResponse.json({ ok: false, error: 'Database query failed' }, { status: 500 });
    }

    const sys = `You are FoodAi's deal assistant. Always reply in Finnish. Summarize top 3-5 discounts with bullet points. Include call-to-action lines that say "Avaa tarjous" with a link to /go/{offerId}. Keep it concise.`;
    const user = `Kysymys: ${query || 'tarjoukset'}\nKaupunki: ${city || 'ei määritelty'}\nTarjoukset JSON: ${JSON.stringify(offers?.slice(0,5) || [])}`;

    const resp = await fetch(DEEPSEEK_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        temperature: 0.2,
        messages: [
          { role: 'system', content: sys },
          { role: 'user', content: user }
        ]
      })
    });

    if (!resp.ok) {
      // Avoid logging secrets
      console.error('DeepSeek API error');
      return NextResponse.json({ ok: false, error: 'AI upstream' }, { status: 502 });
    }

    const json = await resp.json();
    return NextResponse.json({ ok: true, answer: json.choices?.[0]?.message?.content ?? '' });
  } catch (error: any) {
    // Avoid logging secrets
    console.error('API error');
    return NextResponse.json({ ok: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}