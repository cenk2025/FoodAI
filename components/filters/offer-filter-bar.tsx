'use client';
import { useRouter, useSearchParams } from 'next/navigation';

export default function OfferFilterBar() {
  const r = useRouter(); const sp = useSearchParams();

  const update = (key: string, val?: string) => {
    const p = new URLSearchParams(sp.toString());
    if (!val || val === '') p.delete(key); else p.set(key, val);
    r.push(`/offers?${p.toString()}`);
  };

  return (
    <div className="sticky top-0 z-10 bg-white/80 dark:bg-neutral-900/80 backdrop-blur border-b p-3 grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
      <input defaultValue={sp.get('q')||''} onKeyDown={e=>{ if(e.key==='Enter') update('q',(e.target as any).value) }} placeholder="Etsi…" className="border rounded-xl px-3 py-2" />
      <select defaultValue={sp.get('city')||''} onChange={e=>update('city', e.target.value)} className="border rounded-xl px-3 py-2">
        <option value="">Kaupunki</option>
        <option>Helsinki</option><option>Espoo</option><option>Vantaa</option>
        <option>Jyväskylä</option><option>Tampere</option><option>Turku</option>
      </select>
      <select defaultValue={sp.get('cuisine')||''} onChange={e=>update('cuisine', e.target.value)} className="border rounded-xl px-3 py-2">
        <option value="">Keittiö</option>
        <option>Sushi</option><option>Burger</option><option>Pizza</option><option>Kebab</option>
      </select>
      <div className="flex items-center gap-2">
        <label className="text-sm">Min %</label>
        <input type="range" min={0} max={80} defaultValue={sp.get('discount_min')||'0'} onChange={e=>update('discount_min', e.target.value)} className="w-full" />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-sm">Max €</label>
        <input type="number" min={0} step="1" defaultValue={sp.get('price_max')||''} onBlur={e=>update('price_max', (e.target as any).value)} className="border rounded-xl px-3 py-2 w-full" />
      </div>
      <div className="flex items-center gap-2">
        <button className={`btn ${sp.get('pickup')==='1'?'btn-primary':''}`} onClick={()=>update('pickup', sp.get('pickup')==='1'?'':'1')}>Nouto</button>
        <button className={`btn ${sp.get('delivery')==='1'?'btn-primary':''}`} onClick={()=>update('delivery', sp.get('delivery')==='1'?'':'1')}>Kotiinkuljetus</button>
      </div>
    </div>
  );
}