"use client"

import { useAuth } from '@/components/auth-provider'
import React from 'react'

function TestSimpleContent() {
  try {
    const auth = useAuth()
    return <div>Success: Auth context is available</div>
  } catch (error: any) {
    return <div>Error: {error.message}</div>
  }
}

export default function TestSimplePage() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <TestSimpleContent />
    </React.Suspense>
  );
}