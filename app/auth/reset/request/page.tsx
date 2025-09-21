'use client';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Changed from false to 0
export const fetchCache = 'force-no-store';

import React from 'react';
import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';

export default function ResetRequestPage() {
  const [email, setEmail] = useState(''); 
  const [message, setMessage] = useState('');
  
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/callback`
    });
    setMessage(error ? error.message : 'Sähköposti lähetetty (jos osoite on rekisteröity).');
  };
  
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };
  
  return (
    <div className="max-w-sm mx-auto pt-24 space-y-6">
      <h1 className="text-3xl font-bold">Vaihda salasana</h1>
      <form onSubmit={submit} className="grid gap-3">
        <input 
          className="border rounded-xl px-3 py-2" 
          placeholder="Sähköposti" 
          value={email} 
          onChange={handleEmailChange} 
        />
        <button className="btn btn-primary" type="submit">Lähetä linkki</button>
      </form>
      {message && <p className="text-sm opacity-80">{message}</p>}
    </div>
  );
}