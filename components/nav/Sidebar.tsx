'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';

// Declare require for dynamic imports
declare const require: any;
const { Home, Percent, MapPin, LayoutGrid, Shield } = require('lucide-react');

export function Sidebar() {
  const pathname = usePathname() || '/fi';
  const locale = pathname.split('/')[1] || 'fi';
  const item = (href: string, label: string, Icon: any) => {
    const active = pathname.startsWith(href);
    return (
      <Link
        className={`flex items-center gap-3 h-11 px-3 rounded-lg
          ${active ? 'bg-black/5 text-slate-900' : 'text-slate-700 hover:bg-slate-100'}`}
        href={href}
      >
        <Icon className="shrink-0" size={18}/>
        <span className="truncate">{label}</span>
      </Link>
    );
  };

  return (
    <aside className="h-full overflow-y-auto pr-2">
      <div className="flex items-center h-12 px-2">
        <span className="font-extrabold">FoodAi</span>
      </div>
      <nav className="mt-1 space-y-1 px-1">
        {item(`/${locale}`, 'Etusivu', Home)}
        {item(`/${locale}/offers`, 'Tarjoukset', Percent)}
        {item(`/${locale}/nearby`, 'Lähellä', MapPin)}
        {item(`/${locale}/dashboard`, 'Kojelauta', LayoutGrid)}
        {item(`/${locale}/admin`, 'Admin', Shield)}
      </nav>
    </aside>
  );
}