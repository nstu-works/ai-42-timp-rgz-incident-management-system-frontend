'use client'

import Link from 'next/link'
import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from './StatusBadge'
import { ThreatIndicator } from './ThreatIndicator'
import { Button } from '@/components/ui/button'

const linkButtonClass =
  'inline-flex items-center rounded px-2 py-1 text-xs font-medium text-[#a78bfa] transition-colors hover:bg-[#27272a]'

export interface IncidentRow {
  id: string
  title: string
  status: string
  threat_level: number
  occurred_at: string
}

interface IncidentTableProps {
  data: IncidentRow[]
  isLoading?: boolean
  onDelete?: (id: string) => void
}

export function IncidentTable({ data, isLoading, onDelete }: IncidentTableProps) {
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
      accessorKey: 'occurred_at',
      header: 'Дата',
      cell: ({ row }) =>
        format(new Date(row.getValue('occurred_at')), 'dd MMM yyyy, HH:mm', {
          locale: ru,
        }),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Link href={`/incidents/${row.original.id}`} className={linkButtonClass}>
            Открыть
          </Link>
          {onDelete && row.original.status === 'closed' && (
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
      emptyMessage="Инцидентов нет"
    />
  )
}
