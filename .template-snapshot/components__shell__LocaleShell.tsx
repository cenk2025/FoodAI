'use client';

import Sidebar from '@/components/nav/Sidebar';
import HeaderBar from '@/components/nav/HeaderBar';
import {ThemeProvider} from 'next-themes';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/fi', label: 'Etusivu' },
  { href: '/fi/offers', label: 'Tarjoukset' },
  { href: '/fi/nearby', label: 'Lähellä' },
  { href: '/fi/dashboard', label: 'Kojelauta' },
  { href: '/fi/admin', label: 'Admin' },
];

export default function LocaleShell({children}:{children:React.ReactNode}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="min-h-dvh bg-background text-foreground">
        {/* SOL SİDEBAR (masaüstü) */}
        <aside
          className="
            sidebar fixed inset-y-0 left-0 z-40 hidden lg:flex
            w-[var(--sidebar-w)] flex-col border-r bg-card
          "
        >
          {/* Logo: sadece masaüstü */}
          <div className="px-6 py-4">
            <Link href="/fi" className="font-semibold tracking-tight">FoodAi</Link>
          </div>

          {/* nav items */}
          <nav className="flex-1 overflow-y-auto px-2 py-2">
            <ul className="space-y-1">
              {NAV.map(({ href, label }) => {
                const active = pathname?.startsWith(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={cn(
                        'flex items-center gap-2 rounded-xl px-3 py-2 text-sm',
                        active ? 'bg-muted font-medium' : 'hover:bg-muted/70'
                      )}
                    >
                      <span className="truncate">{label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* MOBİL OFFCANVAS DRAWER */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-50 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-[var(--sidebar-w)] bg-card border-r transform transition-transform duration-300 ease-in-out lg:hidden",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {/* Logo: sadece mobil drawer */}
          <div className="px-6 py-4 border-b">
            <Link href="/fi" className="font-semibold tracking-tight">FoodAi</Link>
          </div>

          {/* nav items */}
          <nav className="flex-1 overflow-y-auto px-2 py-2">
            <ul className="space-y-1">
              {NAV.map(({ href, label }) => {
                const active = pathname?.startsWith(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={cn(
                        'flex items-center gap-2 rounded-xl px-3 py-2 text-sm',
                        active ? 'bg-muted font-medium' : 'hover:bg-muted/70'
                      )}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="truncate">{label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* HEADER + CONTENT */}
        <div className="relative lg:pl-[var(--sidebar-w)]">
          <header
            className="
              sticky top-0 z-30
              bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60
              border-b
            "
          >
            <div className="flex h-14 items-center gap-2 px-4 sm:px-6">
              {/* Hamburger: sadece mobil */}
              <button 
                className="lg:hidden p-2 rounded-lg hover:bg-muted" 
                onClick={() => setSidebarOpen(true)}
                aria-label="Toggle sidebar"
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Logo: sadece mobil */}
              <div className="lg:hidden">
                <Link href="/fi" className="font-semibold tracking-tight">FoodAi</Link>
              </div>

              <div className="flex-1" />

              {/* HeaderBar component for other header elements */}
              <HeaderBar />
            </div>
          </header>

          {/* Sayfa içeriği */}
          <main className="px-4 py-6 sm:px-6">
            {children}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}