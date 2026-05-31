'use client'

import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { PageContainer } from '@/components/layout/PageContainer'
import { StatsCard } from '@/components/stats/StatsCard'
import { DataTable } from '@/components/shared/DataTable'
import { useRole } from '@/hooks/useRole'
import {
  useIncidentCountV1StatsIncidentCountGet,
  useTopVulnerabilitiesV1StatsTopVulnerabilitiesGet,
} from '@/api/generated/stats/stats'
import type { TopVulnerability } from '@/api/generated/iMSIncidentManagementSystem.schemas'

const currentYear = new Date().getFullYear()
const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3)

const vulnColumns: ColumnDef<TopVulnerability>[] = [
  {
    accessorKey: 'vuln_name',
    header: 'Уязвимость',
    cell: ({ row }) => (
      <span className="text-[#fafafa]">{row.getValue('vuln_name')}</span>
    ),
  },
  {
    accessorKey: 'incident_count',
    header: 'Кол-во инцидентов',
    cell: ({ row }) => (
      <span className="font-mono text-[#a78bfa]">{row.getValue('incident_count')}</span>
    ),
  },
]

export default function StatsPage() {
  const { canViewStats } = useRole()

  const today = new Date().toISOString().slice(0, 10)
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  const [startDate, setStartDate] = useState(monthAgo)
  const [endDate, setEndDate] = useState(today)
  const [quarter, setQuarter] = useState<number>(currentQuarter)
  const [year, setYear] = useState<number>(currentYear)

  const { data: countData, isLoading: countLoading } = useIncidentCountV1StatsIncidentCountGet(
    { start: startDate, end: endDate },
    { query: { enabled: canViewStats } }
  )

  const { data: vulnData, isLoading: vulnLoading } = useTopVulnerabilitiesV1StatsTopVulnerabilitiesGet(
    { quarter, year },
    { query: { enabled: canViewStats } }
  )

  const incidentCount = (countData as any)?.data?.data?.count ?? 0
  const vulns: TopVulnerability[] = (vulnData as any)?.data?.data ?? []

  if (!canViewStats) {
    return (
      <PageContainer title="Статистика">
        <p className="text-[#71717a]">Недостаточно прав для просмотра статистики.</p>
      </PageContainer>
    )
  }

  return (
    <PageContainer title="Статистика">
      <div className="space-y-8">
        {/* Section 1: Incident count by date range */}
        <section>
          <h2 className="mb-4 text-lg font-medium text-[#fafafa]">Количество инцидентов за период</h2>
          <div className="mb-4 flex flex-wrap gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#71717a]">Начало</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-md border border-[#27272a] bg-[#18181b] px-3 py-1.5 text-sm text-[#fafafa] outline-none focus:border-[#7c3aed]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#71717a]">Конец</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-md border border-[#27272a] bg-[#18181b] px-3 py-1.5 text-sm text-[#fafafa] outline-none focus:border-[#7c3aed]"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatsCard
              title="Инцидентов"
              value={incidentCount}
              description={`с ${startDate} по ${endDate}`}
              isLoading={countLoading}
            />
          </div>
        </section>

        {/* Section 2: Top vulnerabilities by quarter */}
        <section>
          <h2 className="mb-4 text-lg font-medium text-[#fafafa]">Топ уязвимостей за квартал</h2>
          <div className="mb-4 flex flex-wrap gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#71717a]">Квартал</label>
              <input
                type="number"
                min={1}
                max={4}
                value={quarter}
                onChange={(e) => setQuarter(Number(e.target.value))}
                className="w-24 rounded-md border border-[#27272a] bg-[#18181b] px-3 py-1.5 text-sm text-[#fafafa] outline-none focus:border-[#7c3aed]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#71717a]">Год</label>
              <input
                type="number"
                min={2000}
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-28 rounded-md border border-[#27272a] bg-[#18181b] px-3 py-1.5 text-sm text-[#fafafa] outline-none focus:border-[#7c3aed]"
              />
            </div>
          </div>
          <DataTable
            columns={vulnColumns}
            data={vulns}
            isLoading={vulnLoading}
            emptyMessage="Нет данных по уязвимостям"
          />
        </section>
      </div>
    </PageContainer>
  )
}
