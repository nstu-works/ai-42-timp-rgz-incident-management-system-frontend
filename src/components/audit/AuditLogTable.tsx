'use client'

import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { DataTable } from '@/components/shared/DataTable'

export interface AuditLogRow {
  id: string
  incident_id: string
  action: string
  changed_at: string
  old_values?: Record<string, unknown> | null
  new_values: Record<string, unknown>
}

interface AuditLogTableProps {
  data: AuditLogRow[]
  isLoading?: boolean
}

export function AuditLogTable({ data, isLoading }: AuditLogTableProps) {
  const columns: ColumnDef<AuditLogRow>[] = [
    {
      accessorKey: 'action',
      header: 'Действие',
      cell: ({ row }) => (
        <span className={`rounded px-2 py-0.5 text-xs font-medium ${
          row.getValue('action') === 'INSERT'
            ? 'bg-[#052e16] text-[#4ade80]'
            : 'bg-[#2e1065] text-[#c4b5fd]'
        }`}>
          {row.getValue('action')}
        </span>
      ),
    },
    {
      accessorKey: 'incident_id',
      header: 'Инцидент',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-[#71717a]">
          {String(row.getValue('incident_id')).slice(0, 8)}…
        </span>
      ),
    },
    {
      accessorKey: 'changed_at',
      header: 'Время',
      cell: ({ row }) =>
        format(new Date(row.getValue('changed_at')), 'dd MMM yyyy, HH:mm:ss', { locale: ru }),
    },
    {
      id: 'changes',
      header: 'Изменения',
      cell: ({ row }) => {
        const newV = row.original.new_values
        const keys = Object.keys(newV).slice(0, 3)
        return (
          <span className="text-xs text-[#71717a]">
            {keys.map((k) => `${k}: ${JSON.stringify(newV[k])}`).join(', ')}
            {Object.keys(newV).length > 3 ? '…' : ''}
          </span>
        )
      },
    },
  ]

  return <DataTable columns={columns} data={data} isLoading={isLoading} emptyMessage="Лог пуст" />
}
