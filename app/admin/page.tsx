'use client';
import {useEffect, useState} from 'react';
import {ClickRow, ClickSummary} from '@/types/db';
import {createSupabaseBrowser} from '@/lib/supabase/browser';
import { useSearchParams } from 'next/navigation';

export default function AdminHome() {
  const sb = createSupabaseBrowser();
  const searchParams = useSearchParams();
  const importSuccess = searchParams.get('importSuccess');
  
  const [clicksData, setClicksData] = useState<ClickSummary[]>([]);
  const [revenue, setRevenue] = useState<number>(0);

  useEffect(() => {
    (async () => {
      // Get click summary
      try {
        const {data} = await sb.rpc('admin_click_summary');
        setClicksData(data ?? []);
      } catch (error) {
        setClicksData([]);
      }
      
      // Get approved commissions
      const { data: rev } = await sb.from('commissions').select('commission_amount').eq('status','approved');
      const totalRevenue = (rev||[]).reduce((a:any,c:any)=>a+(c.commission_amount||0),0);
      setRevenue(totalRevenue);
    })();
  }, [sb]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold">Admin Dashboard</h1>
      
      {importSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Success! </strong>
          <span className="block sm:inline">CSV file imported successfully.</span>
        </div>
      )}
      
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border p-4">
          <div className="text-sm opacity-70">Clicks (7d)</div>
          <div className="text-2xl font-bold">{clicksData && clicksData.length > 0 ? clicksData[0].cnt : 0}</div>
        </div>
        <div className="rounded-2xl border p-4">
          <div className="text-sm opacity-70">Approved Commission (€)</div>
          <div className="text-2xl font-bold">{revenue.toFixed(2)}</div>
        </div>
        <div className="rounded-2xl border p-4">
          <a className="btn btn-primary inline-block" href="/admin/commissions/import">Import CSV</a>
          <div className="mt-2 text-sm">
            <a href="/sample-commissions.csv" className="text-blue-600 hover:underline" download>
              Download sample CSV
            </a>
          </div>
        </div>
      </div>
      
      <div className="rounded-2xl border p-4">
        <h2 className="text-xl font-bold mb-2">Offer Management</h2>
        <a className="btn btn-primary inline-block" href="/admin/offers/new">Create New Offer</a>
      </div>
    </div>
  );
}