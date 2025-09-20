'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { createSupabaseBrowser } from '@/lib/supabase/browser';
import { useLocale } from 'next-intl';

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale(); // Use next-intl hook for better locale handling
  const supabase = createSupabaseBrowser();
  const [loading, setLoading] = useState(false);

  async function signInGoogle() {
    setLoading(true);
    try {
      // Get the redirect path from search params or default to dashboard
      const next = searchParams.get('next') || `/${locale}`;
      const redirectTo = `${window.location.origin}/auth/callback?next=${next}`;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      });
      
      if (error) {
        console.error('OAuth error', error.message);
        // TODO: Add user-facing error notification
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-md mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-semibold">
        {locale === 'fi' ? 'Kirjaudu sisään' : 'Sign in'}
      </h1>
      <button
        onClick={signInGoogle}
        disabled={loading}
        className="px-4 py-2 rounded-xl bg-red-500 text-white disabled:opacity-50"
      >
        {loading 
          ? (locale === 'fi' ? 'Yönlendiriliyor...' : 'Redirecting...') 
          : (locale === 'fi' ? 'Google ile giriş yap' : 'Sign in with Google')
        }
      </button>
    </main>
  );
}