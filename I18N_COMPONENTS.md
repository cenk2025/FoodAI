# Multilingual Components with next-intl

This document explains how to create multilingual navbar and footer components using next-intl's `useTranslations` hook.

## Components

### LocaleSwitcher (`components/nav/LocaleSwitcher.tsx`)

A locale switcher component that:
- Preserves URL and query parameters when switching languages
- Uses next-intl hooks for proper localization
- Provides accessible buttons with aria-pressed attributes
- Handles edge cases with null pathnames and search params

### Navbar (`components/nav/Navbar.tsx`)

A responsive navbar that:
- Uses `useTranslations` to get translated navigation labels
- Automatically switches languages based on the current locale
- Maintains proper routing when switching languages
- Works on both mobile and desktop
- Integrates the LocaleSwitcher component

### Footer (`components/nav/Footer.tsx`)

A footer component that:
- Displays translated navigation links
- Shows language-specific copyright text
- Provides language switching functionality through LocaleSwitcher
- Uses the same translation approach as Navbar

## Implementation Details

### 1. Using useTranslations Hook

```tsx
'use client';
import { useTranslations } from 'next-intl';

export default function Component() {
  const t = useTranslations('nav'); // 'nav' is the namespace in your translation files
  
  return (
    <nav>
      <Link href="/home">{t('home')}</Link>
      <Link href="/about">{t('about')}</Link>
    </nav>
  );
}
```

### 2. Locale Switcher with URL Preservation

The LocaleSwitcher component preserves query parameters and paths when switching languages:

```tsx
function switchTo(nextLocale: 'fi' | 'en') {
  const qs = searchParams?.toString() || '';
  const path = pathname || '/';
  const url = `/${nextLocale}${path.replace(/^\/(fi|en)/, '')}${qs ? `?${qs}` : ''}`;
  router.push(url);
}
```

### 3. Middleware Configuration

The middleware is configured to handle both root redirects and locale-prefixed paths:

```ts
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['fi', 'en'],
  defaultLocale: 'fi',
  localePrefix: 'as-needed'
});

export const config = {
  matcher: ['/', '/(fi|en)/:path*']
};
```

### 4. SEO Optimization with hreflang

The layout includes hreflang metadata for better SEO:

```tsx
export const metadata: Metadata = {
  title: 'FoodAi',
  alternates: {
    languages: {
      fi: '/fi',
      en: '/en'
    }
  }
};
```

### 5. Translation Files Structure

The translation files (`i18n/messages/*.json`) should have a structure like:

```json
{
  "nav": {
    "home": "Home",
    "about": "About",
    "contact": "Contact"
  }
}
```

## Usage

1. Import the components in your layout:

```tsx
import Navbar from '@/components/nav/Navbar';
import Footer from '@/components/nav/Footer';
```

2. Include them in your layout:

```tsx
export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}
```

## Testing

To test the multilingual functionality:

1. Visit `http://localhost:3001/fi/example` for Finnish
2. Visit `http://localhost:3001/en/example` for English
3. Use the language switcher in the navbar/footer to toggle between languages

The URLs will automatically update, all content will be translated accordingly, and query parameters will be preserved.

## Quick Test Commands

```bash
# Redirect and locale cookie
curl -I http://localhost:3001/      # 307 → /fi
curl -I http://localhost:3001/fi    # 200
curl -I http://localhost:3001/en    # 200

# Prod behavior
npm run build && npm run start -p 3001
```