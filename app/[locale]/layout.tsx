import Navbar from '@/components/nav/Navbar';
import Footer from '@/components/nav/Footer';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
    >
      <div className="min-h-dvh flex flex-col">
        <Navbar />
        {/* Sidebar ve grid YOK */}
        <div className="mx-auto max-w-screen-2xl px-3 lg:px-6 flex-1">
          <main className="min-h-[calc(100dvh-4rem)]">
            {children}
          </main>
          <Footer />
        </div>
      </div>
    </NextIntlClientProvider>
  );
}