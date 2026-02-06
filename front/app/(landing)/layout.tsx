import { Header } from '@/components/layout/header'
import React from 'react'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <div className="mx-auto max-w-6xl pb-8 px-4 w-full">
        {children}
      </div>
    </>
  )
}

