import React from 'react'
import StoreNavbar from '@/components/store/StoreNavbar'

export const metadata = {
  title: 'Nhân viên - Dashboard'
}

export default function StaffLayout({ children }) {
  return (
    <div>
      <StoreNavbar />
      <main className="p-8">
        {children}
      </main>
    </div>
  )
}
