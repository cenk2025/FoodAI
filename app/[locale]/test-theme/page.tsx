'use client';

import { useTheme } from 'next-themes';
import React from 'react';

function TestThemeContent() {
  const { theme, setTheme } = useTheme();
  
  return (
    <div>
      <h1>Test Theme Page</h1>
      <p>Current theme: {theme}</p>
      <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
        Toggle Theme
      </button>
    </div>
  );
}

export default function TestThemePage() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <TestThemeContent />
    </React.Suspense>
  );
}