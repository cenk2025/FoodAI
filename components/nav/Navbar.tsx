'use client';

import Link from 'next/link';
import {useState, useMemo} from 'react';
import {useTranslations} from 'next-intl';
import {usePathname} from 'next/navigation';
import {LocaleSwitcher} from '@/components/nav/LocaleSwitcher';

export default function Navbar() {
  const t = useTranslations('nav');
  const pathname = usePathname() || '/fi';
  const locale = pathname.split('/')[1] || 'fi';
  const [open, setOpen] = useState(false);

  const navItems = useMemo(() => ([
    { href: `/${locale}`, key: 'home' },
    { href: `/${locale}/offers`, key: 'offers' },
    { href: `/${locale}/nearby`, key: 'nearby' },
    { href: `/${locale}/dashboard`, key: 'dashboard' },
    { href: `/${locale}/admin`, key: 'admin' },
  ]), [locale]);

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-black/5">
      <div className="mx-auto max-w-screen-2xl px-4 h-16 flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-4">
          {/* Hamburger (mobile) */}
          <button
            className="inline-flex md:hidden h-10 w-10 items-center justify-center rounded-xl border border-black/10"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen(v => !v)}
          >
            {/* basit icon */}
            <div className="space-y-1.5">
              <span className="block h-0.5 w-5 bg-black"></span>
              <span className="block h-0.5 w-5 bg-black"></span>
              <span className="block h-0.5 w-5 bg-black"></span>
            </div>
          </button>

          <Link href={`/${locale}`} className="font-extrabold text-xl tracking-tight">
            FoodAi
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive(item.href)
                    ? 'bg-black/5 text-black'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-black/5'
                }`}
              >
                {t(item.key)}
              </Link>
            ))}
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <LocaleSwitcher />
          <Link
            href={`/${locale}/auth/signin`}
            className="h-10 inline-flex items-center rounded-xl px-4 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
          >
            {locale === 'fi' ? 'Kirjaudu' : 'Sign in'}
          </Link>
        </div>
      </div>

      {/* Mobile menu (collapsible) */}
      {open && (
        <div className="md:hidden border-t border-black/5">
          <div className="px-4 py-3 grid gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`px-3 py-2 rounded-lg text-base ${
                  isActive(item.href)
                    ? 'bg-black/5 text-black'
                    : 'text-slate-700 hover:bg-black/5'
                }`}
              >
                {t(item.key)}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}