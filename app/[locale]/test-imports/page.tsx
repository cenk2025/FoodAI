'use client';

import HeaderBar from '@/components/nav/HeaderBar';
import React from 'react';
declare const require: any;
const { ThemeProvider } = require('next-themes');

function TestImportsContent() {
  return (
    <div>
      <h1>Test Imports</h1>
      <p>If this page loads, the imports are working correctly.</p>
    </div>
  );
}

export default function TestImports() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <TestImportsContent />
    </React.Suspense>
  );
}