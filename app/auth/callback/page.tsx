'use client';
import { useEffect } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import {redirect} from 'next/navigation';

export default function OAuthCallback() {
  redirect('/fi/dashboard');
}
