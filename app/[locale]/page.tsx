// Declare require for dynamic imports
declare const require: any;

const HomePage = require('@/components/pages/HomePage').default;

// Declare the module since we can't resolve the types
const { getTranslations } = require('next-intl/server');

// Optional: Force static generation for this page
export const dynamic = 'force-static';

export default async function HomeLocale({ params }: { params: { locale: string } }) {
  return <HomePage />;
}