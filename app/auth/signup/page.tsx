'use client';
import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const [email,setEmail]=useState(''); const [password,setPassword]=useState('');
  const [name,setName]=useState('');
  const r = useRouter();
  const onSubmit = async (e:any) => {
    e.preventDefault();
    const supabase = supabaseBrowser();
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password, 
      options: { 
        data: { display_name: name },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
      }
    });
    if (error) return alert(error.message);
    r.push('/dashboard');
  };
  return (
    <div className="max-w-sm mx-auto pt-24 space-y-6">
      <h1 className="text-3xl font-bold">Rekisteröidy</h1>
      <form onSubmit={onSubmit} className="grid gap-3">
        <input className="border rounded-xl px-3 py-2" placeholder="Nimi" value={name} onChange={e=>setName(e.target.value)} />
        <input className="border rounded-xl px-3 py-2" placeholder="Sähköposti" value={email} onChange={e=>setEmail(e.target.value)} />
        <input type="password" className="border rounded-xl px-3 py-2" placeholder="Salasana" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="btn btn-primary">Luo tili</button>
      </form>
      <p className="text-sm"><a className="link" href="/auth/signin">Kirjaudu</a></p>
    </div>
  );
}