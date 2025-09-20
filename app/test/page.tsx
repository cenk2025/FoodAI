"use client"

import { Button } from '@/components/ui/button'
import { useState } from 'react'

export default function TestPage() {
  const [count, setCount] = useState(0)

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <h1 className="text-3xl font-bold mb-8">Component Test Page</h1>
      
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4">
          <Button onClick={() => setCount(count + 1)}>
            Count: {count}
          </Button>
          
          <Button variant="secondary">
            Secondary Button
          </Button>
          
          <Button variant="outline">
            Outline Button
          </Button>
          
          <Button variant="destructive">
            Destructive Button
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <Button size="sm">
            Small Button
          </Button>
          
          <Button size="lg">
            Large Button
          </Button>
        </div>
      </div>
    </div>
  )
}