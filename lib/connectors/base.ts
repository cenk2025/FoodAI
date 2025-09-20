import { createClient } from '@supabase/supabase-js';
import type { Offer } from './types';
import type { Database } from '@/types/supabase';

export class Upserter {
  admin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE!
  );

  async upsert(providerSlug: string, offers: Offer[]) {
    const { data: p, error: providerError } = await this.admin.from('providers').select('id').eq('slug', providerSlug).single();
    
    if (providerError || !p) {
      throw new Error('Provider missing: ' + providerSlug + ' - ' + (providerError?.message || 'not found'));
    }
    
    const rows = offers.map(o => ({
      provider_id: (p as any).id,
      title: o.title,
      description: o.description,
      original_price: o.original_price ?? null,
      discounted_price: o.discounted_price,
      currency: o.currency || 'EUR',
      pickup: !!o.pickup,
      delivery: o.delivery ?? true,
      city: o.city || null,
      deep_link: o.deep_link,
      image_url: o.image_url || null,
      tags: o.tags || []
    }));
    
    if (rows.length === 0) {
      console.log(`No offers to upsert for provider: ${providerSlug}`);
      return;
    }
    
    const { error } = await this.admin.from('offers').upsert(rows as any, { 
      onConflict: 'provider_id,deep_link'
    });
    
    if (error) {
      throw new Error('Failed to upsert offers: ' + error.message);
    }
    
    console.log(`Successfully upserted ${rows.length} offers for provider: ${providerSlug}`);
  }
}