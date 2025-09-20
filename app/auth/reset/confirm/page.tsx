'use client';

// Declare React namespace
declare namespace React {
  type FormEvent = any;
  type ChangeEvent = any;
}

import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default function ResetConfirmPage() {
  const r = useRouter(); 
  const sp = useSearchParams();
  const [ready,setReady]=useState(false);
  const [pwd,setPwd]=useState(''); 
  const [msg,setMsg]=useState('');

  useEffect(()=>{
    (async()=>{
      // Supabase redirects with ?code=...&type=recovery
      const code = sp?.get('code');
      if (code) {
        const s = supabaseBrowser();
        const { error } = await s.auth.exchangeCodeForSession(code);
        if (error) { setMsg(error.message); return; }
      }
      setReady(true);
    })();
  },[sp]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const s = supabaseBrowser();
    const { error } = await s.auth.updateUser({ password: pwd });
    if (error) setMsg(error.message);
    else r.push('/dashboard');
  };

  if (!ready) return <div className="p-10">Ladataan…</div>;
  return (
    <div className="max-w-sm mx-auto pt-24 space-y-6">
      <h1 className="text-3xl font-bold">Uusi salasana</h1>
      <form onSubmit={submit} className="grid gap-3">
        <input type="password" className="border rounded-xl px-3 py-2" placeholder="Uusi salasana" value={pwd} onChange={(e: any)=>setPwd(e.target.value)} />
        <button className="btn btn-primary" type="submit">Tallenna</button>
      </form>
      {msg && <p className="text-sm opacity-80">{msg}</p>}
    </div>
  );
}