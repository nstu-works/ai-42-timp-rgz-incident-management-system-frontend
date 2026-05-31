'use client'

import { useState } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { AuditLogTable, AuditLogRow } from '@/components/audit/AuditLogTable'
import { useRole } from '@/hooks/useRole'
import {
  useListLogV1IncidentLogGet,
  useGetLogByIncidentV1IncidentLogIncidentIdGet,
} from '@/api/generated/incident-log/incident-log'

export default function AuditPage() {
  const { canViewAudit } = useRole()
  const [filterInput, setFilterInput] = useState('')
  const [activeFilter, setActiveFilter] = useState('')

  const allLogsQuery = useListLogV1IncidentLogGet({
    query: { enabled: canViewAudit && !activeFilter },
  })

  const filteredLogsQuery = useGetLogByIncidentV1IncidentLogIncidentIdGet(activeFilter, {
    query: { enabled: canViewAudit && !!activeFilter },
  })

  const isLoading = activeFilter ? filteredLogsQuery.isLoading : allLogsQuery.isLoading
  const rawData = activeFilter
    ? (filteredLogsQuery.data as any)?.data
    : (allLogsQuery.data as any)?.data

  const logs: AuditLogRow[] = (rawData ?? []).map((entry: any) => ({
    id: entry.id,
    incident_id: entry.incident_id,
    action: entry.action,
    changed_at: entry.changed_at,
    old_values: entry.old_values ?? null,
    new_values: entry.new_values,
  }))

  if (!canViewAudit) {
    return (
      <PageContainer title="Лог аудита">
        <p className="text-[#71717a]">Недостаточно прав для просмотра лога аудита.</p>
      </PageContainer>
    )
  }

  return (
    <PageContainer title="Лог аудита">
      <div className="space-y-6">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#71717a]">Фильтр по ID инцидента</label>
            <input
              type="text"
              placeholder="UUID инцидента"
              value={filterInput}
              onChange={(e) => setFilterInput(e.target.value)}
              className="w-80 rounded-md border border-[#27272a] bg-[#18181b] px-3 py-1.5 text-sm text-[#fafafa] outline-none focus:border-[#7c3aed]"
            />
          </div>
          <button
            onClick={() => setActiveFilter(filterInput.trim())}
            className="rounded-lg bg-[#7c3aed] px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#6d28d9]"
          >
            Фильтровать
          </button>
          <button
            onClick={() => {
              setFilterInput('')
              setActiveFilter('')
            }}
            className="rounded-lg border border-[#27272a] px-4 py-1.5 text-sm font-medium text-[#71717a] transition-colors hover:bg-[#27272a] hover:text-[#fafafa]"
          >
            Сбросить
          </button>
        </div>

        <AuditLogTable data={logs} isLoading={isLoading} />
      </div>
    </PageContainer>
  )
}
