'use client';

import { Moon, Sun } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';

export default function Header({ onOpenMobile }: { onOpenMobile: () => void }) {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const locale = pathname?.split('/')?.[1] ?? 'fi';
  const other = locale === 'fi' ? 'en' : 'fi';

  return (
    <header
      className="
        fixed top-0 right-0 z-50
        left-[var(--sb-collapsed)]
        h-16 bg-white/70 backdrop-blur border-b border-black/5
        flex items-center
      "
    >
      <div className="w-full max-w-7xl mx-auto px-4 flex items-center justify-between">
        {/* Mobil hamburger */}
        <button
          onClick={onOpenMobile}
          className="lg:hidden -ml-1 p-2 rounded-lg hover:bg-slate-100"
          aria-label="Open menu"
        >
          <Menu />
        </button>

        {/* sağdaki butonlar… */}
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
      </div>
    </header>
  );
}