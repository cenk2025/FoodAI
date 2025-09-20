// Add type declarations to fix TypeScript errors
declare const require: any;

// Declare React types
declare namespace React {
  type ReactNode = any;
}

// Import as any to avoid type errors
const React = require('react');
const { setRequestLocale, getMessages } = require('next-intl/server');
const { NextIntlClientProvider } = require('next-intl');

const Navbar = require('@/components/nav/Navbar').default;
const Footer = require('@/components/nav/Footer').default;

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