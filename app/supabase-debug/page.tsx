'use client';
import { useEffect, useState } from 'react';
import { createSupabaseBrowser } from '@/lib/supabase/browser';

export default function SupabaseDebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [clientInfo, setClientInfo] = useState<any>({});

  useEffect(() => {
    // Check environment variables
    const envVars = {
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NEXT_PUBLIC_GOOGLE_ENABLED: process.env.NEXT_PUBLIC_GOOGLE_ENABLED,
    };

    // Check if variables exist and are valid
    const hasUrl = !!envVars.NEXT_PUBLIC_SUPABASE_URL;
    const hasKey = !!envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const isUrlValid = hasUrl ? (() => {
      try {
        new URL(envVars.NEXT_PUBLIC_SUPABASE_URL!);
        return true;
      } catch {
        return false;
      }
    })() : false;

    const isPlaceholder = (hasUrl && envVars.NEXT_PUBLIC_SUPABASE_URL!.includes('your-')) || 
                         (hasKey && envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY!.includes('your-'));

    setDebugInfo({
      envVars,
      hasUrl,
      hasKey,
      isUrlValid,
      isPlaceholder,
      urlCheck: hasUrl ? envVars.NEXT_PUBLIC_SUPABASE_URL!.substring(0, 50) + '...' : 'undefined',
      keyCheck: hasKey ? envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY!.substring(0, 20) + '...' : 'undefined',
    });

    // Test creating the Supabase client
    try {
      console.log('Attempting to create Supabase client...');
      const client = createSupabaseBrowser();
      
      setClientInfo({
        clientCreated: true,
        clientType: typeof client,
        hasFromMethod: typeof client.from === 'function',
        hasAuth: !!client.auth,
        hasRpc: typeof client.rpc === 'function',
      });
    } catch (error) {
      setClientInfo({
        clientCreated: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Supabase Client Debug</h1>
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Environment Variables</h2>
        <div className="bg-gray-100 p-4 rounded-lg">
          <pre className="whitespace-pre-wrap">{JSON.stringify(debugInfo, null, 2)}</pre>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Client Information</h2>
        <div className="bg-gray-100 p-4 rounded-lg">
          <pre className="whitespace-pre-wrap">{JSON.stringify(clientInfo, null, 2)}</pre>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Browser Console Output</h2>
        <p className="text-gray-600">
          Check your browser's developer console for detailed logs from the Supabase client creation process.
        </p>
      </div>
    </div>
  );
}