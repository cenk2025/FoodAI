import React from 'react';
import {setRequestLocale, getMessages} from 'next-intl/server';
import {NextIntlClientProvider} from 'next-intl';
import Navbar from '@/components/nav/Navbar';
import Footer from '@/components/nav/Footer';

export function generateStaticParams() {
  // projenizdeki diller
  return [{locale: 'fi'}, {locale: 'en'}];
}

// (opsiyonel) bu segmenti SSG'ye zorlamak istersen:
export const dynamic = 'force-static';

export default async function LocaleLayout({
  children,
  params: {locale}
}: {
  children: React.ReactNode;
  params: {locale: string};
}) {
  // 🔴 KRİTİK: next-intl için locale'i sabitle
  setRequestLocale(locale);

  // Artık getMessages() statik render'ı bozmaz
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <Navbar />
          <div className="container">
            <main className="min-h-[calc(100dvh-4rem)]">{children}</main>
            <Footer />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}