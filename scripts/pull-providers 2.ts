import 'dotenv/config';
import { Upserter } from '@/lib/connectors/base';
import { fetchWoltOffers } from '@/lib/connectors/wolt';
import { fetchFoodoraOffers } from '@/lib/connectors/foodora';
import { fetchResqOffers } from '@/lib/connectors/resq';

async function run() {
  console.log('Starting provider data pull...');
  
  const up = new Upserter();
  
  try {
    console.log('Fetching Wolt offers...');
    await up.upsert('wolt', await fetchWoltOffers());
  } catch (error) {
    console.error('Error fetching Wolt offers:', error);
  }
  
  try {
    console.log('Fetching Foodora offers...');
    await up.upsert('foodora', await fetchFoodoraOffers());
  } catch (error) {
    console.error('Error fetching Foodora offers:', error);
  }
  
  try {
    console.log('Fetching ResQ offers...');
    await up.upsert('resq', await fetchResqOffers());
  } catch (error) {
    console.error('Error fetching ResQ offers:', error);
  }
  
  console.log('Provider data pull completed');
}

run().catch(e => { 
  console.error('Fatal error:', e); 
  process.exit(1); 
});