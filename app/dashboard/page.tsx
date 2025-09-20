'use client';
import {useState, useEffect} from 'react';
import {Offer, OfferFilters} from '@/types/db';
import {createSupabaseBrowser} from '@/lib/supabase/browser';
import { useRouter } from 'next/navigation';

// Prevent static rendering
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function DashboardPage() {
  const router = useRouter();
  const sb = createSupabaseBrowser();
  
  const [filters, setFilters] = useState<OfferFilters>({});
  const [offers, setOffers] = useState<Offer[]>([]);

  // örnek setterler:
  const setCity = (v: string) => setFilters((f) => ({...f, city: v}));
  const setCuisine = (v: string) => setFilters((f) => ({...f, cuisine: v}));
  const setDiscountMin = (v: number) => setFilters((f)=>({...f, discount_min: v}));
  const setPriceMax = (v: number) => setFilters((f)=>({...f, price_max: v}));
  const setPickup = (v: boolean) => setFilters((f)=>({...f, pickup: v}));
  const setDelivery = (v: boolean) => setFilters((f)=>({...f, delivery: v}));

  // Fetch offers based on filters
  useEffect(() => {
    (async () => {
      let query = sb.from('offer_index').select('*').order('discount_percent', { ascending: false });
      
      if (filters.city) query = query.eq('city', filters.city);
      if (filters.cuisine) query = query.eq('cuisine', filters.cuisine);
      if (filters.discount_min) query = query.gte('discount_percent', filters.discount_min);
      if (filters.price_max) query = query.lte('discounted_price', filters.price_max);
      if (filters.pickup !== undefined) query = query.eq('pickup', filters.pickup);
      if (filters.delivery !== undefined) query = query.eq('delivery', filters.delivery);
      
      const { data, error } = await query;
      if (!error) {
        setOffers(data || []);
      }
    })();
  }, [filters, sb]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <div className="grid gap-3 max-w-2xl mt-4">
        <input 
          className="input border rounded-xl px-3 py-2" 
          placeholder="City" 
          value={filters.city ?? ''} 
          onChange={(e)=>setCity(e.target.value)} 
        />
        <input 
          className="input border rounded-xl px-3 py-2" 
          placeholder="Cuisine" 
          value={filters.cuisine ?? ''} 
          onChange={(e)=>setCuisine(e.target.value)} 
        />
        <input 
          className="input border rounded-xl px-3 py-2" 
          type="number" 
          placeholder="Min. discount %" 
          value={filters.discount_min ?? ''} 
          onChange={(e)=>setDiscountMin(Number(e.target.value) || 0)} 
        />
        <input 
          className="input border rounded-xl px-3 py-2" 
          type="number" 
          placeholder="Max. price" 
          value={filters.price_max ?? ''} 
          onChange={(e)=>setPriceMax(Number(e.target.value) || 0)} 
        />
        <label className="flex items-center gap-2">
          <input 
            type="checkbox" 
            checked={!!filters.pickup} 
            onChange={(e)=>setPickup(e.target.checked)} 
          /> Pickup
        </label>
        <label className="flex items-center gap-2">
          <input 
            type="checkbox" 
            checked={!!filters.delivery} 
            onChange={(e)=>setDelivery(e.target.checked)} 
          /> Delivery
        </label>
      </div>

      <ul className="mt-6">
        {offers.map((o)=>(
          <li key={o.id} className="border rounded-xl p-3 mb-2">
            <a href={`/go/${o.id}`} className="link">
              {o.title} — {o.city}
              {o.discount_percent && ` (${o.discount_percent.toFixed(0)}% off)`}
            </a>
          </li>
        ))}
      </ul>
      
      <div className="mt-6 grid gap-4">
        <button className="btn" onClick={() => router.push('/favorites')}>Favorites</button>
        <button className="btn" onClick={() => router.push('/alerts')}>Alerts</button>
        <form action="/signout" method="post">
          <button className="btn btn-primary" type="submit">Sign Out</button>
        </form>
      </div>
    </div>
  );
}