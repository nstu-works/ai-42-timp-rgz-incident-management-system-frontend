// src/components/layout/Topbar.tsx
'use client'

import { LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth'
import { useAuth } from '@/hooks/useAuth'

const ROLE_LABELS: Record<string, string> = {
  guard: 'Охранник',
  operator: 'Оператор',
  analyst: 'Аналитик',
  admin: 'Администратор',
}

export function Topbar() {
  const user = useAuthStore((s) => s.user)
  const { logout } = useAuth()

  return (
    <header className="flex h-14 items-center justify-between border-b border-[#27272a] bg-[#18181b] px-6">
      <div />
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm">
          <User size={14} className="text-[#71717a]" />
          <span className="text-[#fafafa]">
            {user?.first_name} {user?.last_name}
          </span>
          <span className="rounded border border-[#27272a] px-1.5 py-0.5 text-xs text-[#a78bfa]">
            {user?.role ? ROLE_LABELS[user.role] : ''}
          </span>
        </div>
        <Button
          data-testid="logout"
          variant="ghost"
          size="icon"
          onClick={logout}
          className="h-8 w-8 text-[#71717a] hover:text-[#fafafa]"
        >
          <LogOut size={16} />
        </Button>
      </div>
    </header>
  )
}
