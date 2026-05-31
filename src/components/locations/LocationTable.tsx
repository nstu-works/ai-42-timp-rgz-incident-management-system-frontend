'use client'

import Link from 'next/link'
import { ColumnDef } from '@tanstack/react-table'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { DataTable } from '@/components/shared/DataTable'
import { Button } from '@/components/ui/button'

export interface LocationRow {
  id: string
  name: string
  location_type: { id: string; name: string }
  address?: string | null
}

interface LocationTableProps {
  data: LocationRow[]
  isLoading?: boolean
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export function LocationTable({ data, isLoading, onEdit, onDelete }: LocationTableProps) {
  const columns: ColumnDef<LocationRow>[] = [
    {
      accessorKey: 'name',
      header: 'Название',
      cell: ({ row }) => (
        <Link
          href={`/locations/${row.original.id}`}
          className="text-[#a78bfa] hover:underline"
        >
          {row.getValue('name')}
        </Link>
      ),
    },
    {
      id: 'type',
      header: 'Тип',
      accessorFn: (row) => row.location_type?.name ?? '',
      cell: ({ row }) => (
        <span className="text-[#fafafa]">{row.original.location_type?.name ?? '—'}</span>
      ),
    },
    {
      accessorKey: 'address',
      header: 'Адрес',
      cell: ({ row }) => (
        <span className="text-[#a1a1aa]">{row.getValue('address') ?? '—'}</span>
      ),
    },
    {
      id: 'actions',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Link
            href={`/locations/${row.original.id}`}
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
      emptyMessage="Локаций нет"
    />
  )
}
