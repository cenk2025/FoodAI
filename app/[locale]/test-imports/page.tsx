'use client';

import HeaderBar from '@/components/nav/HeaderBar';
declare const require: any;
const { ThemeProvider } = require('next-themes');

export default function TestImports() {
  return (
    <div>
      <h1>Test Imports</h1>
      <p>If this page loads, the imports are working correctly.</p>
    </div>
  );
}