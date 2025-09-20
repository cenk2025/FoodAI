import {NextRequest, NextResponse} from 'next/server';
import {createSupabaseServer} from '@/lib/supabase/server';
import {ClickInsert, Offer} from '@/types/db';

type Params = { params: { id: string } };

export async function GET(req: NextRequest, {params}: Params) {
  const id = params.id;
  const sb = createSupabaseServer();

  // 1) Teklif bulun
  const {data: offer, error} = await sb
    .from('offer_index')
    .select('*')
    .eq('id', id)
    .maybeSingle<Offer>();

  if (error || !offer) {
    return NextResponse.redirect(new URL(`/fi?missing=${encodeURIComponent(id)}`, req.nextUrl.origin));
  }

  // 2) clickouts kaydı (best-effort; hata verse bile redirect)
  try {
    const ua = req.headers.get('user-agent') ?? '';
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '0.0.0.0';

    const payload: ClickInsert = {
      offer_id: offer.id,
      provider_id: offer.provider_id,
      ua, ip,
    };

    // Use any to bypass typing issues while maintaining the structure
    await sb.from('clickouts').insert([payload] as any);
  } catch {}

  // 3) hedef link
  const target = offer.deep_link ?? offer.image_url ?? 'https://foodai.fi';
  return NextResponse.redirect(target);
}