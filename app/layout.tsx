import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import AiAssistant from "@/components/ai/AiAssistant";
import "./globals.css";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import { LanguageProvider } from "@/lib/i18n/context";

import { LocationProvider } from "@/lib/context/LocationContext";
import AuthHashHandler from "@/components/auth/AuthHashHandler";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: {
    default: "FoodAi - Suomen Parhaat Ruokatarjoukset",
    template: "%s | FoodAi"
  },
  description: "Vertaile ruokien hintoja Wolt, Foodora ja UberEats alustoilla. Löydä halvin pizza, burgeri tai sushi Helsingissä, Espoossa ja Vantaalla. Säästä jopa 50% jokaisesta tilauksesta.",
  keywords: ["ruokatarjoukset", "hintavertailu", "Wolt alennuskoodi", "Foodora tarjous", "Helsinki ravintolat", "ilmainen kuljetus", "halpa ruoka"],
  authors: [{ name: "FoodAi Team" }],
  metadataBase: new URL('https://foodai.fi'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "FoodAi - Suomen Parhaat Ruokatarjoukset | Säästä Ruoassa",
    description: "Tekoäly etsii puolestasi kaupungin parhaat ravintolatarjoukset ja alennukset. Vertaile hinnat ja tilaa halvemmalla.",
    type: "website",
    locale: 'fi_FI',
    siteName: 'FoodAi',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "name": "FoodAi",
      "url": "https://foodai.fi",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://foodai.fi/search?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "Organization",
      "name": "FoodAi Suomi",
      "url": "https://foodai.fi",
      "logo": "https://foodai.fi/logo.png",
      "description": "Suomen johtava ruoan hintavertailupalvelu, joka käyttää tekoälyä parhaiden tarjousten löytämiseen.",
      "sameAs": [
        "https://facebook.com/foodai",
        "https://twitter.com/foodai",
        "https://instagram.com/foodai"
      ]
    }
  ]
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable} font-outfit antialiased bg-[#fffcf8]`} suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <LanguageProvider>
          <LocationProvider>
            <AuthHashHandler />
            <Header />
            <main className="pb-24 md:pb-0">
              {children}
            </main>
            <BottomNav />
            <AiAssistant />
          </LocationProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

