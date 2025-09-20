import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!
);

async function upsertProvider(slug: string, name: string, website: string) {
  const { error } = await admin.from('providers').upsert({ slug, name, website }, { onConflict: 'slug' });
  if (error) throw error;
}

async function run() {
  await upsertProvider('wolt', 'Wolt', 'https://wolt.com');
  await upsertProvider('foodora', 'Foodora', 'https://foodora.fi');
  await upsertProvider('resq', 'ResQ Club', 'https://resq-club.com');

  const { data: prov } = await admin.from('providers').select('id, slug').in('slug',['wolt','foodora','resq']);
  const id = (slug:string)=>prov?.find(p=>p.slug===slug)?.id;

  const offers = [
    { provider_id:id('wolt'), title:'Burger Menü', original_price:12.90, discounted_price:7.90, city:'Jyväskylä',
      deep_link:'https://example.com/wolt/burger', image_url:'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1200&auto=format&fit=crop' },
    { provider_id:id('foodora'), title:'Sushi Setti -30%', original_price:14.90, discounted_price:10.43, city:'Helsinki',
      deep_link:'https://example.com/foodora/sushi', image_url:'https://images.unsplash.com/photo-1542736667-069246bdbc74?q=80&w=1200&auto=format&fit=crop' },
    { provider_id:id('resq'), title:'ResQ Lounasboksi', original_price:9.90, discounted_price:4.90, city:'Tampere',
      deep_link:'https://example.com/resq/lunch', image_url:'https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=1200&auto=format&fit=crop' }
  ];

  for (const o of offers) {
    const { error } = await admin.from('offers').insert(o);
    if (error && !/duplicate key/.test(error.message)) throw error;
  }
  console.log('Seed OK');
}
run().catch(e=>{ console.error(e); process.exit(1); });
