// Add type declarations to fix TypeScript errors
declare const require: any;

// Import as any to avoid type errors
const { getTranslations } = require('next-intl/server');

// Optional: Force static generation for this page
export const dynamic = 'force-static';

export default async function Health() {
  return <div style={{padding: 24, fontSize: 18}}>ok</div>;
}