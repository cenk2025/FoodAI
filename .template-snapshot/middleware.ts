import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';

export default function middleware(request: NextRequest) { 
  if (process.env.NODE_ENV === "development") {
    return new Response(null, { status: 204 }); // no-op
  }
  return createMiddleware({
    locales: ['fi', 'en'],
    defaultLocale: 'fi'
  })(request);
}

export const config = {
  matcher: process.env.NODE_ENV === "development" ? [] : ['/', '/(fi|en)/:path*']
};