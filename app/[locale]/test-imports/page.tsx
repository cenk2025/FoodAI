'use client';

import HeaderBar from '@/components/nav/HeaderBar';
import {ThemeProvider} from 'next-themes';

export default function TestImports() {
  return (
    <div>
      <h1>Test Imports</h1>
      <p>If this page loads, the imports are working correctly.</p>
    </div>
  );
}