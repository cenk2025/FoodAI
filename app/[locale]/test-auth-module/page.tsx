'use client';

declare const require: any;
import React from 'react';

function TestAuthModuleContent() {
  let authProviderModule;
  let AuthProvider;
  let error;
  
  try {
    authProviderModule = require('@/components/auth-provider');
    AuthProvider = authProviderModule.AuthProvider || authProviderModule.default || authProviderModule;
  } catch (e: any) {
    error = e.message;
  }
  
  return (
    <div>
      <h1>Test Auth Module</h1>
      <p>Module loaded: {authProviderModule ? 'Yes' : 'No'}</p>
      <p>AuthProvider found: {AuthProvider ? 'Yes' : 'No'}</p>
      {error && <p>Error: {error}</p>}
      {authProviderModule && (
        <div>
          <p>Module keys: {Object.keys(authProviderModule).join(', ')}</p>
        </div>
      )}
    </div>
  );
}

export default function TestAuthModule() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <TestAuthModuleContent />
    </React.Suspense>
  );
}