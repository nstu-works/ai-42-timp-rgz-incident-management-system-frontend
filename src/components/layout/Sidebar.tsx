// src/components/layout/Sidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import {
  AlertTriangle,
  Shield,
  MapPin,
  Tag,
  Users,
  FileText,
} from 'lucide-react'
import type { UserRole } from '@/types'

const NAV_ITEMS: {
  href: string
  label: string
  icon: React.ElementType
  roles: UserRole[]
}[] = [
  {
    href: '/incidents',
    label: 'Инциденты',
    icon: AlertTriangle,
    roles: ['guard', 'operator', 'analyst', 'admin'],
  },
  {
    href: '/vulnerabilities',
    label: 'Уязвимости',
    icon: Shield,
    roles: ['operator', 'analyst', 'admin'],
  },
  {
    href: '/locations',
    label: 'Локации',
    icon: MapPin,
    roles: ['guard', 'operator', 'analyst', 'admin'],
  },
  {
    href: '/categories',
    label: 'Категории',
    icon: Tag,
    roles: ['guard', 'operator', 'analyst', 'admin'],
  },
  {
    href: '/users',
    label: 'Пользователи',
    icon: Users,
    roles: ['operator', 'admin'],
  },
  {
    href: '/audit',
    label: 'Аудит',
    icon: FileText,
    roles: ['admin'],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const role = useAuthStore((s) => s.user?.role)

  const visible = NAV_ITEMS.filter(
    (item) => role && item.roles.includes(role)
  )

  return (
    <aside className="flex w-60 flex-shrink-0 flex-col border-r border-[#27272a] bg-[#18181b]">
      <div className="flex h-14 items-center border-b border-[#27272a] px-4">
        <Link href="/" className="text-lg font-semibold text-[#a78bfa] hover:text-[#c4b5fd] transition-colors">
          IMS
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {visible.map((item) => {
          const Icon = item.icon
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                active
                  ? 'bg-[#2e1065] text-[#a78bfa]'
                  : 'text-[#71717a] hover:bg-[#27272a] hover:text-[#fafafa]'
              }`}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
