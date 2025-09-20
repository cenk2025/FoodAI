import HomePage from '@/components/pages/HomePage';
import { redirect } from 'next/navigation';

export default function HomeLocale({ params }: { params: { locale: string } }) {
  const locale = params.locale ?? 'fi';
  // dev'de fallback
  if (process.env.NODE_ENV === 'development' && (locale !== 'fi' && locale !== 'en')) {
    redirect('/fi');
  }
  
  // Log the current working directory in development
  if (process.env.NODE_ENV === 'development') {
    console.log("[FoodAI] page.tsx LIVE from:", process.cwd());
  }
  
  return <HomePage />;
}

// İsteğe bağlı: Verinin her zaman taze gelmesi için
export const dynamic = 'force-dynamic';