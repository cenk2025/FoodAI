'use client';

declare const require: any;

export default function TestAuthProvider() {
  const authProviderModule = require('@/components/auth-provider');
  const AuthProvider = authProviderModule.AuthProvider;
  
  if (!AuthProvider) {
    return <div>Error: Could not import AuthProvider</div>;
  }
  
  return (
    <div>
      <h1>Test AuthProvider</h1>
      <p>AuthProvider import: {AuthProvider ? 'Success' : 'Failed'}</p>
    </div>
  );
}