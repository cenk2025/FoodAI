'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { LocaleSwitcher } from '@/components/nav/LocaleSwitcher';

export default function Footer() {
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
    <footer className="bg-white border-t border-gray-200 px-4 py-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link href={`/${locale}`} className="font-bold text-lg">
              FoodAi
            </Link>
            <p className="text-sm text-gray-600 mt-1">
              {locale === 'fi' ? 'Älykäs ruoka kaikille' : 'Smart food for everyone'}
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
              >
                {t(item.key)}
              </Link>
            ))}
          </div>
          
          <div className="mt-4 md:mt-0">
            <LocaleSwitcher />
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-6 pt-6 text-center text-sm text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} FoodAi.{' '}
            {locale === 'fi' ? 'Kaikki oikeudet pidätetään.' : 'All rights reserved.'}
          </p>
        </div>
      </div>
    </footer>
  );
}