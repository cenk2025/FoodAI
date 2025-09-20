// components/nav/left-rail.tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Percent, MapPin, LayoutGrid, Shield } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

// Export the left rail width constant
export const LEFT_RAIL_PX = 80; // 64px rail + 16px gap

export default function LeftRail() {
  const t = useTranslations();
  const locale = useLocale();
  const path = usePathname();
  
  const prefix = `/${locale}`; // always
  
  const items = [
    { key: 'home',     icon: Home,       label: t('nav.home'),     href: `${prefix}` },
    { key: 'offers',   icon: Percent,    label: t('nav.offers'),   href: `${prefix}/offers` },
    { key: 'nearby',   icon: MapPin,     label: t('nav.nearby'),   href: `${prefix}/nearby` },
    { key: 'dashboard',icon: LayoutGrid, label: t('nav.dashboard'),href: `${prefix}/dashboard` },
    { key: 'admin',    icon: Shield,     label: t('nav.admin'),    href: `${prefix}/admin` }
  ];

  return (
    <nav
      className="
        hidden md:flex group
        fixed left-0 top-0 z-20 h-screen
        w-16 hover:w-56 transition-[width] duration-200
        border-r bg-white/80 dark:bg-zinc-900/80 backdrop-blur
      "
      aria-label="Päävalikko"
    >
      <ul className="mt-2 w-full">
        <li className="py-4 text-center font-extrabold text-sm">🍟</li>
        {items.map(({ key, icon: Icon, label, href }) => {
          const active = path?.startsWith(href);
          return (
            <li key={key}>
              <Link
                href={href}
                className={`flex items-center gap-3 px-4 py-3 opacity-70 hover:opacity-100 ${active ? 'font-bold' : ''}`}
              >
                <Icon className="h-6 w-6 flex-none" />
                {/* Etiket sadece hover/geniş durumunda görünür */}
                <span className="truncate text-sm origin-left scale-90 md:opacity-0 md:group-hover:opacity-100 md:group-hover:scale-100 transition">
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}