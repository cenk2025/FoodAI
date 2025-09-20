'use client';
import { ThemeProvider as NextThemes } from 'next-themes';
export function ThemeProvider({ 
  children,
  attribute = "class", 
  defaultTheme = "system", 
  enableSystem = true 
}: { 
  children: React.ReactNode;
  attribute?: string;
  defaultTheme?: string;
  enableSystem?: boolean;
}) {
  return (
    <NextThemes attribute={attribute} defaultTheme={defaultTheme} enableSystem={enableSystem}>
      {children}
    </NextThemes>
  );
}