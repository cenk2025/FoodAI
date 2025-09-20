'use client';
import {useEffect, useState} from 'react';
import {createSupabaseBrowser} from '@/lib/supabase/browser';
import type {Offer} from '@/types/db';

// Prevent static rendering
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// Create a type that matches the offer_index view structure
type OfferIndex = Pick<
  Offer,
  | 'id'
  | 'title'
  | 'discount_percent'
  | 'discounted_price'
  | 'city'
  | 'cuisine'
  | 'pickup'
  | 'delivery'
  | 'image_url'
  | 'created_at'
  | 'provider_slug'
> & {
  tags: string[] | null;
  lat: number | null;
  lon: number | null;
  ends_at: string | null;
};

export default function OffersPage() {
  const sb = createSupabaseBrowser();
  const [offers, setOffers] = useState([] as OfferIndex[]); // <— önemli

  useEffect(() => {
    (async () => {
      const {data} = await sb
        .from('offer_index')
        .select('*')
        .order('discount_percent', {ascending: false});
      setOffers((data ?? []) as OfferIndex[]);
    })();
  }, [sb]);

  return (
    <ul className="grid gap-4">
      {offers.map((o: OfferIndex) => (
        <li key={o.id}>
          <span>{o.title}</span> — <span>{o.city}</span>
        </li>
      ))}
    </ul>
  );
}