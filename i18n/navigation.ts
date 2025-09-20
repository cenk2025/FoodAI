import { createSharedPathnamesNavigation } from 'next-intl/navigation';

export const locales = ['fi', 'en'] as const;
export const localePrefix = 'always'; // Default: 'always'

export const { Link, redirect, usePathname, useRouter } = createSharedPathnamesNavigation({ 
  locales,
  localePrefix
});