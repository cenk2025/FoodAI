// app/[locale]/admin/page.tsx
import { redirect } from 'next/navigation';
import { createSupabaseServer } from '@/lib/supabase/server';
import { getTranslations } from 'next-intl/server';
import { assertAdmin } from '@/app/(guards)/admin/guard';
import { Database } from '@/types/supabase';

export default async function AdminPage() {
  // Use the guard pattern to check authentication and admin privileges
  await assertAdmin();
  
  const t = await getTranslations();
  const s = createSupabaseServer();
  const { data: { user } } = await s.auth.getUser();
  
  // Now that we've confirmed the user is an admin, fetch the profile data
  const { data: profile } = await s.from('profiles').select('email').eq('id', user!.id).single<Database['public']['Tables']['profiles']['Row']>();

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">{t('nav.admin')}</h1>
      <p>{t('admin.welcome', {email: profile?.email || 'N/A'})}</p>
      <div className="p-6">Admin paneli</div>
    </div>
  );
}