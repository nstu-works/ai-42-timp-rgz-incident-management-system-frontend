// src/components/layout/Providers.tsx
'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { queryClient } from '@/lib/query-client'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-right"
        theme="dark"
        toastOptions={{
          classNames: {
            toast: 'border border-[#27272a] bg-[#18181b] text-[#fafafa]',
            success: '!bg-emerald-950 border-emerald-500/40 text-emerald-100',
            error: '!bg-red-950 border-red-500/40 text-red-100',
          },
        }}
      />
    </QueryClientProvider>
  )
}
