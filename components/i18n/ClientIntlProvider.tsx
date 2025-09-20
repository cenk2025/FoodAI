'use client';
import { NextIntlClientProvider } from 'next-intl';

export default function ClientIntlProvider(props: {
  locale: string;
  messages: Record<string, any>;
  children: React.ReactNode;
}) {
  return (
    <NextIntlClientProvider
      locale={props.locale}
      messages={props.messages}
      onError={(err:any) => {
        // MISSING_MESSAGE'leri sessiz geç, diğerlerini konsola bas
        if (err?.code === 'MISSING_MESSAGE') return;
        // console.error(err);
      }}
    >
      {props.children}
    </NextIntlClientProvider>
  );
}