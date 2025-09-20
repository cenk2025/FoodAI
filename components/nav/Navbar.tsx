'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { LocaleSwitcher } from '@/components/nav/LocaleSwitcher';

export default function Navbar() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const locale = pathname?.split('/')?.[1] ?? 'fi';

  const navItems = [
    { href: `/${locale}`, key: 'home' },
    { href: `/${locale}/offers`, key: 'offers' },
    { href: `/${locale}/nearby`, key: 'nearby' },
    { href: `/${locale}/dashboard`, key: 'dashboard' },
    { href: `/${locale}/admin`, key: 'admin' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-6">
        <Link href={`/${locale}`} className="font-bold text-lg">
          FoodAi
        </Link>
        
        <div className="hidden md:flex items-center space-x-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              {t(item.key)}
            </Link>
          ))}
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <LocaleSwitcher />
        
        <Link
          href={`/${locale}/auth/signin`}
          className="px-4 py-1.5 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700"
        >
          {locale === 'fi' ? 'Kirjaudu' : 'Sign in'}
        </Link>
      </div>
    </nav>
  );
}