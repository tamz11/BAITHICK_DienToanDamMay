import React, { Suspense } from 'react'
import StatusClient from './StatusClient'

export default function Page() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center">
        <div className="p-8 bg-white rounded shadow">Đang tải...</div>
      </main>
    }>
      <StatusClient />
    </Suspense>
  )
}
