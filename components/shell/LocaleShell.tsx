'use client';

// Declare React namespace
declare namespace React {
  type ReactNode = any;
}

import Header from '@/components/nav/header';

// Declare require for dynamic imports
declare const require: any;
const { ThemeProvider } = require('next-themes');
const { Menu } = require('lucide-react');

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
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
        <Header />

        {/* MAIN */}
        <div
          className="
            pt-16
          "
        >
          <main className="w-full max-w-7xl mx-auto px-4 py-8">
            {children}
          </main>
        </div>

        {/* MOBİL OFFCANVAS DRAWER */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-50 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-300 ease-in-out lg:hidden",
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
      </div>
    </ThemeProvider>
  );
}