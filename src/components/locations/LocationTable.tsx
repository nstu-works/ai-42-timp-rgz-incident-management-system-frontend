'use client'

import Link from 'next/link'
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/shared/DataTable'
import { Button } from '@/components/ui/button'

const linkButtonClass =
  'inline-flex items-center rounded px-2 py-1 text-xs font-medium text-[#a78bfa] transition-colors hover:bg-[#27272a]'

export interface LocationRow {
  id: string
  name: string
  location_type: { id: string; name: string }
  address?: string | null
}

interface LocationTableProps {
  data: LocationRow[]
  isLoading?: boolean
  onDelete?: (id: string) => void
}

export function LocationTable({ data, isLoading, onDelete }: LocationTableProps) {
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
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Link href={`/locations/${row.original.id}`} className={linkButtonClass}>
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
      emptyMessage="Локаций нет"
    />
  )
}
