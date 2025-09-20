import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import LocaleShell from '@/components/shell/LocaleShell';
import '../../styles/globals.css';

export const metadata: Metadata = {
  title: 'FoodAi',
};

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider messages={messages}>
          <LocaleShell>{children}</LocaleShell>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}