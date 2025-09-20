'use client';

import {useEffect, useState} from 'react';
import {Provider, Offer} from '@/types/db';
import {createSupabaseBrowser} from '@/lib/supabase/browser';
import ImageUploader from '@/components/admin/image-uploader';
import { useRouter } from 'next/navigation';

type OfferForm = Pick<
  Offer,
  | 'title'
  | 'description'
  | 'city'
  | 'cuisine'
  | 'original_price'
  | 'discounted_price'
  | 'pickup'
  | 'delivery'
  | 'restaurant_id'
  | 'provider_id'
  | 'image_url'
  | 'deep_link'
  | 'status'
> & {
  description: string;
  cuisine: string;
  image_url: string;
  deep_link: string;
};

export default function AdminOfferNew() {
  const router = useRouter();
  const sb = createSupabaseBrowser();

  const [providers, setProviders] = useState<Provider[]>([]);
  const [form, setForm] = useState<OfferForm>({
    title: '',
    description: '',
    city: '',
    cuisine: '',
    original_price: 0,
    discounted_price: 0,
    pickup: true,
    delivery: true,
    restaurant_id: undefined,
    provider_id: '',
    image_url: '',
    deep_link: '',
    status: 'active',
  });

  useEffect(() => {
    (async () => {
      const {data} = await sb.from('providers').select('id,name,slug').order('name');
      setProviders(data ?? []);
      if (data && data[0]) setForm((f) => ({...f, provider_id: data[0].id}));
    })();
  }, [sb]);

  function upd<K extends keyof OfferForm>(k: K, v: OfferForm[K]) {
    setForm((f) => ({...f, [k]: v}));
  }

  async function save() {
    const { error } = await sb.from('offers').insert([form]);
    if (error) {
      console.error('Error saving offer:', error);
      // TODO: Add toast notification for error
    } else {
      // TODO: Add toast notification for success
      router.push('/admin/offers');
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">New Offer</h1>

      <div className="mt-4 grid gap-3 max-w-xl">
        <select 
          className="border rounded-xl px-3 py-2" 
          value={form.provider_id} 
          onChange={(e)=>upd('provider_id', e.target.value)}
        >
          {providers.map((p)=>(
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        
        <input 
          className="border rounded-xl px-3 py-2" 
          placeholder="Title" 
          value={form.title} 
          onChange={(e)=>upd('title', e.target.value)} 
        />
        
        <textarea 
          className="border rounded-xl px-3 py-2" 
          placeholder="Description" 
          value={form.description} 
          onChange={(e)=>upd('description', e.target.value)} 
        />
        
        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1">
            <span>Original Price (€)</span>
            <input 
              type="number" 
              step="0.01" 
              className="border rounded-xl px-3 py-2" 
              value={form.original_price} 
              onChange={(e)=>upd('original_price', parseFloat(e.target.value) || 0)} 
            />
          </label>
          <label className="grid gap-1">
            <span>Discounted Price (€)</span>
            <input 
              type="number" 
              step="0.01" 
              className="border rounded-xl px-3 py-2" 
              value={form.discounted_price} 
              onChange={(e)=>upd('discounted_price', parseFloat(e.target.value) || 0)} 
            />
          </label>
        </div>
        
        <input 
          className="border rounded-xl px-3 py-2" 
          placeholder="City" 
          value={form.city} 
          onChange={(e)=>upd('city', e.target.value)} 
        />
        
        <input 
          className="border rounded-xl px-3 py-2" 
          placeholder="Cuisine" 
          value={form.cuisine} 
          onChange={(e)=>upd('cuisine', e.target.value)} 
        />
        
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input 
              type="checkbox" 
              checked={form.pickup} 
              onChange={(e)=>upd('pickup', e.target.checked)} 
            />
            Pickup
          </label>
          <label className="flex items-center gap-2">
            <input 
              type="checkbox" 
              checked={form.delivery} 
              onChange={(e)=>upd('delivery', e.target.checked)} 
            />
            Delivery
          </label>
        </div>
        
        <label className="grid gap-1">
          <span>Deep Link</span>
          <input 
            className="border rounded-xl px-3 py-2" 
            placeholder="Deep link URL" 
            value={form.deep_link} 
            onChange={(e)=>upd('deep_link', e.target.value)} 
          />
        </label>
        
        <label className="grid gap-1">
          <span>Image URL</span>
          <input 
            id="imgUrl" 
            className="border rounded-xl px-3 py-2" 
            placeholder="Image URL" 
            value={form.image_url} 
            onChange={(e)=>upd('image_url', e.target.value)} 
          />
        </label>
        
        <ImageUploader onDone={(u) => upd('image_url', u)} />
        
        <div className="flex gap-2">
          <button className="btn btn-primary" onClick={save}>Save</button>
          <button className="btn" onClick={() => router.push('/admin')}>Cancel</button>
        </div>
      </div>
    </div>
  );
}