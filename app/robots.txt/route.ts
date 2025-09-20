import { NextResponse } from 'next/server';
export function GET() {
  return new NextResponse(
`User-agent: *
Allow: /
Sitemap: ${process.env.NEXT_PUBLIC_SITE_URL}/sitemap.xml
`, { headers: { 'Content-Type': 'text/plain' }});
}