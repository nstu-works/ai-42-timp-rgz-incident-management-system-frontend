'use client'

import Link from 'next/link'
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/shared/DataTable'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ROLE_LABELS } from '@/schemas/user'

export interface UserRow {
  id: string
  first_name: string
  last_name: string
  surname?: string | null
  email: string
  role: string
  is_active: boolean
}

interface UserTableProps {
  data: UserRow[]
  isLoading?: boolean
  onDelete?: (id: string) => void
}

const roleBadgeClass: Record<string, string> = {
  admin: 'bg-[#7c3aed]/20 text-[#a78bfa]',
  operator: 'bg-blue-500/20 text-blue-400',
  analyst: 'bg-emerald-500/20 text-emerald-400',
  guard: 'bg-[#71717a]/20 text-[#a1a1aa]',
}

export function UserTable({ data, isLoading, onDelete }: UserTableProps) {
  const columns: ColumnDef<UserRow>[] = [
    {
      accessorKey: 'first_name',
      header: 'Имя',
      cell: ({ row }) => {
        const u = row.original
        const fullName = [u.first_name, u.last_name, u.surname].filter(Boolean).join(' ')
        return (
          <Link
            href={`/users/${u.id}`}
            className="text-[#a78bfa] hover:underline"
          >
            {fullName}
          </Link>
        )
      },
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => (
        <span className="text-[#fafafa]">{row.getValue('email')}</span>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Роль',
      cell: ({ row }) => {
        const role = row.getValue('role') as string
        return (
          <span
            className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${roleBadgeClass[role] ?? 'bg-[#71717a]/20 text-[#a1a1aa]'}`}
          >
            {ROLE_LABELS[role as keyof typeof ROLE_LABELS] ?? role}
          </span>
        )
      },
    },
    {
      accessorKey: 'is_active',
      header: 'Активен',
      cell: ({ row }) => {
        const active = row.getValue('is_active') as boolean
        return (
          <Badge variant={active ? 'default' : 'outline'}>
            {active ? 'Да' : 'Нет'}
          </Badge>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Link
            href={`/users/${row.original.id}`}
            className="inline-flex items-center rounded px-2 py-1 text-xs font-medium text-[#a78bfa] transition-colors hover:bg-[#27272a]"
          >
            Открыть
          </Link>
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-400 hover:text-red-300"
              onClick={() => onDelete(row.original.id)}
            >
              Удалить
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      emptyMessage="Пользователей нет"
    />
  )
}
