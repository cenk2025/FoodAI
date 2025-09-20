'use client';

// Declare React namespace
declare namespace React {
  type FormEvent = any;
}

import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default function ResetRequestPage() {
  const [email,setEmail]=useState(''); 
  const [msg,setMsg]=useState('');
  
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const s = supabaseBrowser();
    const { error } = await s.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/callback`
    });
    setMsg(error ? error.message : 'Sähköposti lähetetty (jos osoite on rekisteröity).');
  };
  
  return (
    <div className="max-w-sm mx-auto pt-24 space-y-6">
      <h1 className="text-3xl font-bold">Vaihda salasana</h1>
      <form onSubmit={submit} className="grid gap-3">
        <input className="border rounded-xl px-3 py-2" placeholder="Sähköposti" value={email} onChange={(e: any)=>setEmail(e.target.value)} />
        <button className="btn btn-primary" type="submit">Lähetä linkki</button>
      </form>
      {msg && <p className="text-sm opacity-80">{msg}</p>}
    </div>
  );
}