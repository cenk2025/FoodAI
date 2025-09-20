import { createSupabaseServer } from '@/lib/supabase/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import dynamic from 'next/dynamic';
import SmartImage from '@/components/smart-image';
const FavoriteButton = dynamic(() => import('@/components/favorite-button'), { ssr: false });

export default async function FavPage() {
  const t = await getTranslations();
  const s = createSupabaseServer();
  const { data:{ user } } = await s.auth.getUser();
  if (!user) redirect('/signin');
  const { data } = await s.from('favorites').select('offer_id, added_at, offers(*)').eq('user_id', user.id)
    .order('added_at', { ascending:false });
  return (
    <div className="p-6">
      <h1 className="text-3xl font-extrabold mb-6">{t('favorites.title')}</h1>
      {data && data.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(data||[]).map((f:any)=>(
            <article key={f.offer_id} className="rounded-3xl border overflow-hidden">
              {f.offers?.image_url && (
                <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
                  <SmartImage
                    src={f.offers.image_url}
                    alt={f.offers.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-4 space-y-2">
                <h3 className="text-lg font-bold">{f.offers?.title}</h3>
                <p className="text-sm opacity-70">{f.offers?.city}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-extrabold">{f.offers?.discounted_price?.toFixed?.(2)} €</span>
                  {f.offers?.discount_percent && <span className="rounded-full px-3 py-1 bg-black text-white text-sm">-{f.offers.discount_percent}%</span>}
                </div>
                <div className="flex gap-2">
                  <a className="btn btn-primary flex-1" href={`/go/${f.offer_id}`}>{t('offers.cta')}</a>
                  {FavoriteButton && <FavoriteButton offerId={f.offer_id} />}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-lg mb-4">{t('favorites.empty')}</p>
          <Link href="/offers" className="btn btn-primary">
            {t('favorites.browse')}
          </Link>
        </div>
      )}
    </div>
  );
}