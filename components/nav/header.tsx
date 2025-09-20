// components/nav/header.tsx
'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';
import RightDrawer from './right-drawer';
import LangSwitch from '@/components/lang-switch';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useTranslations, useLocale } from 'next-intl';

export default function Header() {
  const t = useTranslations();
  const locale = useLocale(); // ← fi/en
  const { theme, setTheme } = useTheme();
  const s = supabaseBrowser();
  const [email, setEmail] = useState<string | null>(null);
  
  const prefix = `/${locale}`;

  useEffect(() => { s.auth.getUser().then(({data})=> setEmail(data.user?.email ?? null)); }, []);

  const signOut = async () => { await s.auth.signOut(); location.reload(); };

  return (
    <header className="sticky top-0 z-30 bg-white/70 dark:bg-zinc-900/70 backdrop-blur border-b">
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Hamburger sadece mobilde */}
        <div className="md:hidden"><RightDrawer /></div>
        <Link href={prefix} className="font-black text-xl">FoodAi</Link>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <LangSwitch />
          <button className="btn-ghost" onClick={()=>setTheme(theme==='dark'?'light':'dark')} aria-label="Theme">
            {theme === 'dark' ? <Sun /> : <Moon />}
          </button>
          {email ? (
            <>
              <span className="text-sm opacity-80 hidden sm:block">{email}</span>
              <button className="btn btn-primary ml-2" onClick={signOut}>{t('auth.signout')}</button>
            </>
          ) : (
            <Link href={`${prefix}/signin`} className="btn btn-primary ml-2">{t('auth.signin.label')}</Link>
          )}
        </div>
      </div>
    </header>
  );
}