'use client';

import { useTheme } from 'next-themes';

export default function TestThemePage() {
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