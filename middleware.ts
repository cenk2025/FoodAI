import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['fi', 'en'],
  defaultLocale: 'fi',
  localePrefix: 'always'
});

export const config = {
  matcher: ['/', '/(fi|en)/:path*']
};