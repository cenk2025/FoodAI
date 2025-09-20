import { ReactNode } from 'react';
import { assertAdmin } from '@/app/(guards)/admin/guard';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await assertAdmin();
  return <div className="p-6">{children}</div>;
}
