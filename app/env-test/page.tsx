// app/env-test/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { createSupabaseBrowser } from '@/lib/supabase/browser';

export default function EnvTest() {
  const [envInfo, setEnvInfo] = useState({
    supabaseUrl: '',
    supabaseKey: '',
    urlValid: false,
    urlError: '',
    containsYour: false,
    clientCreated: false,
    clientError: ''
  });

  useEffect(() => {
    // Get environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    // Check URL validity
    let urlValid = false;
    let urlError = '';
    try {
      if (supabaseUrl) {
        new URL(supabaseUrl);
        urlValid = true;
      }
    } catch (e) {
      urlError = e instanceof Error ? e.message : 'Unknown error';
    }
    
    // Check for placeholder values
    const containsYour = supabaseUrl.includes('your-') || supabaseKey.includes('your-');
    
    // Try to create the Supabase client
    let clientCreated = false;
    let clientError = '';
    try {
      const client = createSupabaseBrowser();
      clientCreated = true;
    } catch (e) {
      clientError = e instanceof Error ? e.message : 'Unknown error';
    }
    
    setEnvInfo({
      supabaseUrl,
      supabaseKey: supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'undefined',
      urlValid,
      urlError,
      containsYour,
      clientCreated,
      clientError
    });
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Environment Variables Test</h1>
      <p><strong>NEXT_PUBLIC_SUPABASE_URL:</strong> {envInfo.supabaseUrl || 'undefined'}</p>
      <p><strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong> {envInfo.supabaseKey}</p>
      <p><strong>URL Valid:</strong> {envInfo.urlValid ? 'Yes' : `No: ${envInfo.urlError}`}</p>
      <p><strong>Contains "your-":</strong> {envInfo.containsYour ? 'Yes' : 'No'}</p>
      <p><strong>Client Created:</strong> {envInfo.clientCreated ? 'Yes' : 'No'}</p>
      {envInfo.clientError && <p><strong>Client Error:</strong> {envInfo.clientError}</p>}
    </div>
  );
}