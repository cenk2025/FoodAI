export const dynamic = 'force-dynamic';
export const revalidate = false;
export const fetchCache = 'force-no-store';

export default function Loading() {
  return <div className="p-10">Ladataan…</div>;
}