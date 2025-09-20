'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useLocale } from 'next-intl';

export default function SignInPage() {
  const supabase = createClientComponentClient();
  const locale = useLocale();

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/${locale}/auth/callback?next=%2F${locale}`
        // Dil dinamikse: `/${new URL(window.location.href).pathname.split('/')[1]}/auth/callback`
      }
    });
  };

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Kirjaudu</h1>
      <button
        onClick={signInWithGoogle}
        className="rounded-lg bg-red-500 px-4 py-2 text-white"
      >
        Google ile giriş
      </button>
    </main>
  );
}