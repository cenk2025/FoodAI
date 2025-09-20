// Declare require for dynamic imports
declare const require: any;
const createMiddleware = require('next-intl/middleware').default;

export default createMiddleware({
  locales: ['fi', 'en'],
  defaultLocale: 'fi',
  localePrefix: 'always'
});

export const config = {
  matcher: ['/', '/(fi|en)/:path*']
};