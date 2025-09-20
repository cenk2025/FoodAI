'use client';
import { useState, useEffect } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';

export default function FavoriteButton({ offerId }: { offerId: string }) {
  const [on, setOn] = useState<boolean>(false);
  useEffect(()=>{ (async()=>{
    const s = supabaseBrowser(); const u = (await s.auth.getUser()).data.user;
    if (!u) return;
    const { data } = await s.from('favorites').select('*').eq('user_id', u.id).eq('offer_id', offerId);
    setOn((data||[]).length>0);
  })() }, [offerId]);

  const toggle = async () => {
    const s = supabaseBrowser(); const u = (await s.auth.getUser()).data.user;
    if (!u) return alert('Kirjaudu sisään');
    if (on) await s.from('favorites').delete().eq('user_id', u.id).eq('offer_id', offerId);
    else await s.from('favorites').insert({ user_id: u.id, offer_id: offerId });
    setOn(!on);
  };

  return <button onClick={toggle} className={`btn ${on?'btn-primary':''}`}>{on?'Suosikissa':'Suosikiksi'}</button>;
}