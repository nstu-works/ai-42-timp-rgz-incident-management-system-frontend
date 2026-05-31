// src/app/(dashboard)/layout.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { useAuthStore } from '@/store/auth'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { accessToken, setAuth } = useAuthStore()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (accessToken) {
      setReady(true)
      return
    }
    axios
      .post(
        'http://localhost:8000/api/v1/auth/refresh',
        {},
        { withCredentials: true }
      )
      .then(({ data }) => {
        setAuth(data.data.access_token, data.data.user)
        setReady(true)
      })
      .catch(() => {
        router.push('/login')
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#09090b]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#a78bfa] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#09090b]">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
