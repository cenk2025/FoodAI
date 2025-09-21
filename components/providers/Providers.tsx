'use client';

import { AuthProvider } from '@/components/auth-provider';
// başka client provider'ların varsa (ThemeProvider vs.) burada sarmala

export default function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}