'use client';

import { useTranslations } from 'next-intl';

export default function ExamplePage() {
  const t = useTranslations('home');
  
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{t('hello')}</h1>
        <p className="text-lg mb-8">
          {useTranslations()('brand')}
        </p>
        <div className="bg-gray-100 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Navigation Example</h2>
          <p className="mb-4">
            This page demonstrates a multilingual setup with next-intl.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Navbar and Footer components use useTranslations hook</li>
            <li>Language switching works automatically</li>
            <li>All content is translated based on the current locale</li>
          </ul>
        </div>
      </main>
    </div>
  );
}