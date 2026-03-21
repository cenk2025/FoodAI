'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Detects Supabase recovery tokens in the URL hash and redirects to /reset-password.
 * Supabase sends recovery emails pointing to the Site URL (foodai.fi) with the token
 * in the hash fragment: #access_token=...&type=recovery
 * This component must be mounted in the root layout to catch it on any page.
 */
export default function AuthHashHandler() {
    const router = useRouter()

    useEffect(() => {
        if (typeof window === 'undefined') return

        const hash = window.location.hash
        if (hash && hash.includes('type=recovery')) {
            // Preserve the full hash so /reset-password can read the access_token
            router.replace('/reset-password' + hash)
        }
    }, [router])

    return null
}
