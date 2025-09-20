import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {locales} from './config';
import fs from 'fs';
import path from 'path';

export default getRequestConfig(async ({locale}) => {
  // Type guard to check if the locale is supported
  if (!locales.includes(locale as any)) notFound();
  
  // Load the appropriate messages for the locale using fs to bypass any caching
  const filePath = path.join(process.cwd(), 'i18n', 'messages', `${locale}.json`);
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const messages = JSON.parse(fileContent);
  
  // Log what we're actually loading
  console.log(`Loaded messages for locale: ${locale}`, messages.section);
  
  return {locale, messages};
});