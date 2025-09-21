'use client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;                 // ✅ sayı
export const fetchCache = 'force-no-store';  // build sırasında fetch yok

export default function ResetRequestPage() {
  return <div>Şifre sıfırlama isteği…</div>;
}
