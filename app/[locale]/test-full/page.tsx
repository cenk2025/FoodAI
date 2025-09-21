import { getTranslations, setRequestLocale } from 'next-intl/server';

export default async function TestFull({ params }: { params: { locale: string } }) {
  // Enable static rendering by setting the locale
  setRequestLocale(params.locale);
  
  const t = await getTranslations('section');
  
  return (
    <div style={{padding: 24}}>
      <h1>Test Full Page</h1>
      <p>This page tests the full locale functionality with translations.</p>
      <p>Featured translation: {t('featured')}</p>
    </div>
  );
}