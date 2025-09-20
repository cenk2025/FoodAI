'use client';

import {useState} from 'react';
import {Menu} from 'lucide-react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';

export default function RightDrawer() {
  const pathname = usePathname();
  const locale = pathname?.split('/')?.[1] ?? 'fi';

  return (
    <Link
      href={`/${locale}/admin`}
      className="rounded-lg p-2 hover:bg-muted md:hidden"
      aria-label="Admin"
    >
      <Menu className="h-5 w-5" />
    </Link>
  );
}
