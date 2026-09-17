'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function ErrorMessage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  if (!error) return null

  return (
    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-xl text-sm border border-red-200 dark:border-red-800/50 text-center font-medium backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
      {error}
    </div>
  )
}

export default function PortalClientError() {
  return (
    <Suspense fallback={null}>
      <ErrorMessage />
    </Suspense>
  )
}
