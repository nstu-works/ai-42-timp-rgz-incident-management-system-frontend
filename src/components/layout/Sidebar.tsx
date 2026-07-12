// src/components/layout/Sidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import {
  AlertTriangle,
  FileText,
  MapPin,
  Shield,
  Tag,
  UserCheck,
  Users,
} from 'lucide-react'
import type { UserRole } from '@/types'
import {
  getGetGuestCountV1UsersGuestCountGetQueryKey,
  getGuestCountV1UsersGuestCountGet,
} from '@/api/generated/users/users'
import { useQuery } from '@tanstack/react-query'

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
    href: '/users/pending',
    label: 'Заявки',
    icon: UserCheck,
    roles: ['admin'],
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
  const isAdmin = role === 'admin'

  const { data: guestCountData } = useQuery({
    queryKey: getGetGuestCountV1UsersGuestCountGetQueryKey(),
    queryFn: ({ signal }) => getGuestCountV1UsersGuestCountGet(signal),
    enabled: isAdmin,
    refetchInterval: 30_000,
  })
  const guestCount: number = (guestCountData as any)?.data?.data?.count ?? 0

  const visible = NAV_ITEMS.filter((item) => role && item.roles.includes(role))

  const activeHref = visible
    .filter((item) => pathname === item.href || pathname.startsWith(item.href + '/'))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href

  return (
    <aside className="flex w-60 flex-shrink-0 flex-col border-r border-[#27272a] bg-[#18181b]">
      <div className="flex h-14 items-center border-b border-[#27272a] px-4">
        <Link
          href="/"
          className="text-lg font-semibold text-[#a78bfa] hover:text-[#c4b5fd] transition-colors"
        >
          IMS
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {visible.map((item) => {
          const Icon = item.icon
          const active = item.href === activeHref
          const showBadge =
            item.href === '/users/pending' && isAdmin && guestCount > 0

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
              {showBadge && (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded bg-red-600 px-1 text-xs font-bold text-white">
                  {guestCount > 99 ? '99+' : guestCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
