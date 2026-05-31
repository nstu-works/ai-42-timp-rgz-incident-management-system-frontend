'use client'

import Link from 'next/link'
import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from './StatusBadge'
import { ThreatIndicator } from './ThreatIndicator'
import { Button } from '@/components/ui/button'

export interface IncidentRow {
  id: string
  title: string
  status: string
  threat_level: number
  occurred_at: string
  location?: { id: string; name: string } | null
  category?: { id: string; name: string } | null
  reporter?: { id: string; first_name: string; last_name: string } | null
}

interface IncidentTableProps {
  data: IncidentRow[]
  isLoading?: boolean
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export function IncidentTable({ data, isLoading, onEdit, onDelete }: IncidentTableProps) {
  const columns: ColumnDef<IncidentRow>[] = [
    {
      accessorKey: 'title',
      header: 'Название',
      cell: ({ row }) => (
        <Link
          href={`/incidents/${row.original.id}`}
          className="text-[#a78bfa] hover:underline"
        >
          {row.getValue('title')}
        </Link>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Статус',
      cell: ({ row }) => <StatusBadge status={row.getValue('status')} />,
    },
    {
      accessorKey: 'threat_level',
      header: 'Угроза',
      cell: ({ row }) => (
        <ThreatIndicator level={row.getValue('threat_level')} />
      ),
    },
    {
      id: 'location',
      header: 'Локация',
      accessorFn: (row) => row.location?.name ?? '',
      cell: ({ row }) => {
        const loc = row.original.location
        if (!loc) return <span className="text-[#a1a1aa]">—</span>
        return (
          <Link href={`/locations/${loc.id}`} className="text-[#a78bfa] hover:underline">
            {loc.name}
          </Link>
        )
      },
    },
    {
      id: 'category',
      header: 'Категория',
      accessorFn: (row) => row.category?.name ?? '',
      cell: ({ row }) => {
        const cat = row.original.category
        if (!cat) return <span className="text-[#a1a1aa]">—</span>
        return (
          <Link href="/categories" className="text-[#a78bfa] hover:underline">
            {cat.name}
          </Link>
        )
      },
    },
    {
      id: 'reporter',
      header: 'Репортировал',
      accessorFn: (row) =>
        row.reporter ? `${row.reporter.first_name} ${row.reporter.last_name}` : '',
      cell: ({ row }) => {
        const r = row.original.reporter
        if (!r) return <span className="text-[#a1a1aa]">—</span>
        return (
          <Link href={`/users/${r.id}`} className="text-[#a78bfa] hover:underline">
            {r.first_name} {r.last_name}
          </Link>
        )
      },
    },
    {
      accessorKey: 'occurred_at',
      header: 'Дата',
      cell: ({ row }) =>
        format(new Date(row.getValue('occurred_at')), 'dd MMM yyyy, HH:mm', {
          locale: ru,
        }),
    },
    {
      id: 'actions',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Link
            href={`/incidents/${row.original.id}`}
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
          {onDelete && row.original.status === 'closed' && (
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
      emptyMessage="Инцидентов нет"
    />
  )
}
