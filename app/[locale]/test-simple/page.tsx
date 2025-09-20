"use client"

import { useAuth } from '@/components/auth-provider'

export default function TestSimplePage() {
  try {
    const auth = useAuth()
    return <div>Success: Auth context is available</div>
  } catch (error: any) {
    return <div>Error: {error.message}</div>
  }
}