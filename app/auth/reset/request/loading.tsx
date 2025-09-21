export const dynamic = 'force-dynamic';
export const revalidate = 0; // Changed from false to 0
export const fetchCache = 'force-no-store';

export default function Loading() {
  return <div className="p-10">Ladataan…</div>;
}