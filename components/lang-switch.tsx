'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';

export default function LangSwitch() {
  const pathname = usePathname();
  const locale = pathname?.split('/')?.[1] ?? 'fi';
  const other = locale === 'fi' ? 'en' : 'fi';

  return (
    <Link
      href={`/${other}${pathname?.slice(3) || ''}`}
      className="rounded-full border px-3 py-1 text-sm hover:bg-muted"
    >
      {other.toUpperCase()}
    </Link>
  );
}