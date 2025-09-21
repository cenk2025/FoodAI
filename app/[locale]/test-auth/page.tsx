"use client"

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

declare const require: any;

export default function TestAuthPage() {
  const { useAuth } = require('@/components/auth-provider');
  
  try {
    const auth = useAuth();
    return <div>Auth is working: {auth.user ? 'User logged in' : 'No user'}</div>;
  } catch (error: any) {
    return <div>Error: {error.message}</div>;
  }
}