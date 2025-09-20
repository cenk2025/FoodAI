'use client';
import { useEffect, useState } from 'react';
import { createSupabaseBrowser } from '@/lib/supabase/browser';

export default function DebugEnvPage() {
  const [envData, setEnvData] = useState<any>({});
  const [clientTest, setClientTest] = useState<any>({});

  useEffect(() => {
    // Client-side environment variables (only NEXT_PUBLIC_ ones)
    const clientEnv = {
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NEXT_PUBLIC_GOOGLE_ENABLED: process.env.NEXT_PUBLIC_GOOGLE_ENABLED,
    };

    // Check URL validity
    let urlValid = false;
    let urlError = '';
    try {
      if (clientEnv.NEXT_PUBLIC_SUPABASE_URL) {
        new URL(clientEnv.NEXT_PUBLIC_SUPABASE_URL);
        urlValid = true;
      }
    } catch (e) {
      urlError = e instanceof Error ? e.message : 'Unknown error';
    }

    // Check for placeholder values
    const containsYour = 
      (clientEnv.NEXT_PUBLIC_SUPABASE_URL && clientEnv.NEXT_PUBLIC_SUPABASE_URL.includes('your-')) ||
      (clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY && clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('your-'));

    setEnvData({
      clientEnv,
      urlValid,
      urlError,
      containsYour,
    });

    // Test the Supabase browser client
    try {
      const client = createSupabaseBrowser();
      setClientTest({
        clientCreated: true,
        clientType: typeof client,
        hasFromMethod: typeof client.from === 'function',
        hasAuth: !!client.auth,
        hasRpc: typeof client.rpc === 'function'
      });
    } catch (error) {
      setClientTest({
        clientCreated: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Variables Debug</h1>
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="text-xl font-semibold mb-2">Client Environment Variables</h2>
        <pre>{JSON.stringify(envData, null, 2)}</pre>
      </div>
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="text-xl font-semibold mb-2">Supabase Client Test</h2>
        <pre>{JSON.stringify(clientTest, null, 2)}</pre>
      </div>
    </div>
  );
}