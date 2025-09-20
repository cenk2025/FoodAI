'use client';

import { Moon, Sun } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { usePathname } from 'next/navigation';

export default function HeaderBar() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const locale = pathname?.split('/')?.[1] ?? 'fi';
  const other = locale === 'fi' ? 'en' : 'fi';

  return (
    <>
      {/* Header elements without hamburger and logo */}
      <div className="flex items-center gap-2">
        {/* Dil */}
        <Link
          href={`/${other}${pathname?.slice(3) || ''}`}
          className="rounded-full border px-3 py-1 text-sm hover:bg-muted"
        >
          {other.toUpperCase()}
        </Link>

        {/* Tema */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="rounded-lg p-2 hover:bg-muted"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* Giriş */}
        <Link
          href={`/${locale}/auth/signin`}
          className="rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Kirjaudu
        </Link>
      </div>
    </>
  );
}
