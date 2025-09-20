'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useLocale } from 'next-intl';

const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

export default function SignInPage() {
  const supabase = createClient();
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