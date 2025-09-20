'use client';

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line 
} from 'recharts';

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

export function ProviderClicksChart({ data }: { data: ProviderClicks[] }) {
  return (
    <div className="h-64 border rounded-2xl p-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="provider" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="clicks" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CityClicksChart({ data }: { data: CityClicks[] }) {
  return (
    <div className="h-64 border rounded-2xl p-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="city" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="clicks" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RevenueChart({ data }: { data: RevenueData[] }) {
  return (
    <div className="h-64 border rounded-2xl p-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="revenue" stroke="#ff7300" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}