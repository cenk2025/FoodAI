import '@/styles/globals.css';

// Declare React namespace
declare namespace React {
  type ReactNode = any;
}

// Declare require for dynamic imports
declare const require: any;
const { ThemeProvider } = require('@/components/theme-provider');

export const metadata: any = {
  title: 'FoodAi – Älykäs ruoka',
  description: 'Alennukset yhdellä sivulla',
  alternates: {
    languages: {
      fi: '/fi',
      en: '/en'
    }
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fi" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}