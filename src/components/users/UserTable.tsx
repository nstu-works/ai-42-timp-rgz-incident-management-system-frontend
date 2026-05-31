'use client'

import Link from 'next/link'
import { ColumnDef } from '@tanstack/react-table'
import { Eye, Pencil, Trash2 } from 'lucide-react'
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
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

const roleBadgeClass: Record<string, string> = {
  admin: 'bg-[#7c3aed]/20 text-[#a78bfa]',
  operator: 'bg-blue-500/20 text-blue-400',
  analyst: 'bg-emerald-500/20 text-emerald-400',
  guard: 'bg-[#71717a]/20 text-[#a1a1aa]',
}

export function UserTable({ data, isLoading, onEdit, onDelete }: UserTableProps) {
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
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Link
            href={`/users/${row.original.id}`}
            title="Открыть"
            className="inline-flex size-7 items-center justify-center rounded-md border border-[#27272a] text-[#a78bfa] transition-colors hover:bg-[#27272a] hover:text-[#c4b5fd]"
          >
            <Eye className="size-3.5" />
          </Link>
          {onEdit && (
            <Button
              variant="ghost"
              size="icon-sm"
              title="Редактировать"
              className="border border-[#27272a] text-[#a78bfa] hover:bg-[#27272a] hover:text-[#c4b5fd]"
              onClick={() => onEdit(row.original.id)}
            >
              <Pencil className="size-3.5" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon-sm"
              title="Удалить"
              className="border border-[#27272a] text-red-400 hover:bg-[#27272a] hover:text-red-300"
              onClick={() => onDelete(row.original.id)}
            >
              <Trash2 className="size-3.5" />
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
