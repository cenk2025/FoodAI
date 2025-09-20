'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = false;
export const fetchCache = 'force-no-store';

function ResetConfirmContent() {
  const router = useRouter(); 
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState(''); 
  const [message, setMessage] = useState('');

  useEffect(() => {
    (async () => {
      // Supabase redirects with ?code=...&type=recovery
      const code = searchParams?.get('code');
      if (code) {
        const supabase = supabaseBrowser();
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) { 
          setMessage(error.message); 
          return; 
        }
      }
      setReady(true);
    })();
  }, [searchParams]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.updateUser({ password: password });
    if (error) setMessage(error.message);
    else router.push('/dashboard');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  if (!ready) return <div className="p-10">Ladataan…</div>;
  return (
    <div className="max-w-sm mx-auto pt-24 space-y-6">
      <h1 className="text-3xl font-bold">Uusi salasana</h1>
      <form onSubmit={submit} className="grid gap-3">
        <input 
          type="password" 
          className="border rounded-xl px-3 py-2" 
          placeholder="Uusi salasana" 
          value={password} 
          onChange={handlePasswordChange} 
        />
        <button className="btn btn-primary" type="submit">Tallenna</button>
      </form>
      {message && <p className="text-sm opacity-80">{message}</p>}
    </div>
  );
}

export default function ResetConfirmPage() {
  return (
    <React.Suspense fallback={<div className="p-10">Ladataan…</div>}>
      <ResetConfirmContent />
    </React.Suspense>
  );
}