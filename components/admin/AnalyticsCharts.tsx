// components/admin/AnalyticsCharts.tsx
'use client';

import dynamic from 'next/dynamic';

const AdminLineChart = dynamic(() => import('./line-chart'), { ssr: false });

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

// Simple bar chart component using plain SVG for provider clicks
export function ProviderClicksChart({ data }: { data: ProviderClicks[] }) {
  const maxClicks = Math.max(...data.map(d => d.clicks), 1);
  
  return (
    <div className="h-64 border rounded-2xl p-2 overflow-x-auto">
      <div className="flex items-end justify-between h-5/6 gap-1 min-w-max">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div 
              className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors"
              style={{ height: `${(item.clicks / maxClicks) * 100}%` }}
            />
            <div className="text-xs mt-1 truncate w-full text-center">{item.provider}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Simple bar chart component using plain SVG for city clicks
export function CityClicksChart({ data }: { data: CityClicks[] }) {
  const maxClicks = Math.max(...data.map(d => d.clicks), 1);
  
  return (
    <div className="h-64 border rounded-2xl p-2 overflow-x-auto">
      <div className="flex items-end justify-between h-5/6 gap-1 min-w-max">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div 
              className="w-full bg-green-500 rounded-t hover:bg-green-600 transition-colors"
              style={{ height: `${(item.clicks / maxClicks) * 100}%` }}
            />
            <div className="text-xs mt-1 truncate w-full text-center">{item.city}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Line chart using the client wrapper component
export function RevenueChart({ data }: { data: RevenueData[] }) {
  // Transform data to match the expected format of AdminLineChart
  const transformedData = data.map(item => ({
    label: item.day,
    value: item.revenue
  }));
  
  return <AdminLineChart data={transformedData} />;
}