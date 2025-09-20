'use client';
import { useSearchParams } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';

export default function SaveAlertFromUrl() {
  const sp = useSearchParams();
  const save = async () => {
    const s = supabaseBrowser(); const u = (await s.auth.getUser()).data.user;
    if (!u) return alert('Kirjaudu sisään');
    const payload:any = { user_id:u.id, active:true };
    ['city','discount_min','price_max','cuisine'].forEach(k=>{
      const v = sp.get(k); if (v) payload[k] = k==='cuisine' ? [v] : (k.includes('min')||k.includes('max') ? Number(v) : v);
    });
    if (sp.get('pickup')==='1') payload.pickup = true;
    if (sp.get('delivery')==='1') payload.delivery = true;
    const { error } = await s.from('alerts').insert(payload);
    if (error) alert(error.message); else alert('Alert tallennettu!');
  };
  return <button className="btn" onClick={save}>Tallenna hälytys</button>;
}