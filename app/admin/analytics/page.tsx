'use client';

import { createSupabaseServer } from '@/lib/supabase/server';

// Dynamically import the chart components to avoid SSR issues
import dynamicImport from 'next/dynamic';

const ProviderClicksChart = dynamicImport(() => import('@/components/admin/RechartsWrapper').then(mod => mod.ProviderClicksChart), { ssr: false });
const CityClicksChart = dynamicImport(() => import('@/components/admin/RechartsWrapper').then(mod => mod.CityClicksChart), { ssr: false });
const RevenueChart = dynamicImport(() => import('@/components/admin/RechartsWrapper').then(mod => mod.RevenueChart), { ssr: false });

export const dynamic = 'force-dynamic';

// Define types for our data
type ProviderClicks = {
  provider: string;
  clicks: number;
};

type CityClicks = {
  city: string;
  clicks: number;
};

type RevenueData = {
  day: string;
  revenue: number;
};

export default async function Analytics() {
  const s = createSupabaseServer();
  
  // Fetch analytics data
  const [byProv, byCity, revenue] = await Promise.all([
    s.rpc('admin_clicks_by_provider').then((r: any) => r.data || []) as Promise<ProviderClicks[]>,
    s.rpc('admin_clicks_by_city').then((r: any) => r.data || []) as Promise<CityClicks[]>,
    s.rpc('admin_revenue_30d').then((r: any) => r.data || []) as Promise<RevenueData[]>
  ]);

  return (
    <div className="p-6 space-y-10">
      <h1 className="text-3xl font-extrabold">Analytics</h1>

      <section>
        <h2 className="text-xl font-bold mb-2">Clicks by Provider (30d)</h2>
        <ProviderClicksChart data={byProv} />
      </section>

      <section>
        <h2 className="text-xl font-bold mb-2">Clicks by City (30d)</h2>
        <CityClicksChart data={byCity} />
      </section>

      <section>
        <h2 className="text-xl font-bold mb-2">Revenue (30d)</h2>
        <RevenueChart data={revenue} />
      </section>
    </div>
  );
}