import HomePage from '@/components/pages/HomePage';
import { getTranslations } from 'next-intl/server';

// Optional: Force static generation for this page
export const dynamic = 'force-static';

export default async function HomeLocale({ params }: { params: { locale: string } }) {
  return <HomePage />;
}