'use client';

import React from 'react';
import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';
export const revalidate = false;
export const fetchCache = 'force-no-store';

function TestAuthRevalidateContent() {
  const [email, setEmail] = useState(''); 
  const [message, setMessage] = useState('');
  
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
  };
  
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };
  
  return (
    <div className="max-w-sm mx-auto pt-24 space-y-6">
      <h1 className="text-3xl font-bold">Test Revalidate</h1>
      <form onSubmit={submit} className="grid gap-3">
        <input 
          className="border rounded-xl px-3 py-2" 
          placeholder="Test" 
          value={email} 
          onChange={handleEmailChange} 
        />
        <button className="btn btn-primary" type="submit">Test</button>
      </form>
      {message && <p className="text-sm opacity-80">{message}</p>}
    </div>
  );
}

export default function TestAuthRevalidate() {
  return <TestAuthRevalidateContent />;
}