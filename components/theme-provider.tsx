'use client';

// Declare React namespace
declare namespace React {
  type ReactNode = any;
}

// Declare require for dynamic imports
declare const require: any;
const { ThemeProvider: NextThemes } = require('next-themes');

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