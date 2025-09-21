'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React from 'react';

function LocaleSwitcherContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations('nav');

  function switchTo(nextLocale: 'fi' | 'en') {
    const qs = searchParams?.toString() || '';
    const path = pathname || '/';
    const url = `/${nextLocale}${path.replace(/^\/(fi|en)/, '')}${qs ? `?${qs}` : ''}`;
    router.push(url);
  }

  return (
    <div className="inline-flex gap-2">
      <button 
        onClick={() => switchTo('fi')} 
        aria-pressed={locale === 'fi'}
        className="px-3 py-1 text-sm rounded-md border border-gray-300 hover:bg-gray-50"
      >
        FI
      </button>
      <button 
        onClick={() => switchTo('en')} 
        aria-pressed={locale === 'en'}
        className="px-3 py-1 text-sm rounded-md border border-gray-300 hover:bg-gray-50"
      >
        EN
      </button>
    </div>
  );
}

export function LocaleSwitcher() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <LocaleSwitcherContent />
    </React.Suspense>
  );
}