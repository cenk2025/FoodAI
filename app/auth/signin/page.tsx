// app/(auth)/signin/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';

export default function SignInPage() {
  const r = useRouter();
  const s = supabaseBrowser();
  const [email,setEmail] = useState(''); const [pwd,setPwd] = useState('');
  const [msg,setMsg] = useState<string>('');

  const emailLogin = async (e:any)=>{
    e.preventDefault();
    const { error } = await s.auth.signInWithPassword({ email, password: pwd });
    if (error) setMsg(error.message); else r.push('/fi/dashboard');
  };
  const google = async ()=>{
    const { error } = await s.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` }
    });
    if (error) setMsg(error.message);
  };

  return (
    <div className="max-w-sm mx-auto py-16 space-y-6">
      <h1 className="text-3xl font-bold">Kirjaudu</h1>
      <form onSubmit={emailLogin} className="grid gap-3">
        <input className="border rounded-2xl px-3 py-2" placeholder="Sähköposti" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="border rounded-2xl px-3 py-2" placeholder="Salasana" type="password" value={pwd} onChange={e=>setPwd(e.target.value)} />
        <button className="btn btn-primary">Kirjaudu sisään</button>
      </form>
      <button onClick={google} className="btn border">Jatka Googlella</button>
      {msg && <p className="text-sm text-red-600">{msg}</p>}
    </div>
  );
}