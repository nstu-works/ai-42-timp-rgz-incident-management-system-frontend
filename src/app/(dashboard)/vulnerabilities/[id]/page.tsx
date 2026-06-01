'use client'

import { use, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { PageContainer } from '@/components/layout/PageContainer'
import { ThreatIndicator } from '@/components/incidents/ThreatIndicator'
import { VulnerabilityForm } from '@/components/vulnerabilities/VulnerabilityForm'
import { Button } from '@/components/ui/button'
import { useRole } from '@/hooks/useRole'
import { useGetVulnerabilityV1VulnerabilitiesVulnIdGet } from '@/api/generated/vulnerabilities/vulnerabilities'
import { VULN_STATUS_LABELS } from '@/schemas/vulnerability'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import type { VulnerabilityStatus } from '@/api/generated/iMSIncidentManagementSystem.schemas'

const VULN_STATUS_CONFIG = {
  open:        { bg: '#422006', color: '#fb923c' },
  in_progress: { bg: '#2e1065', color: '#c4b5fd' },
  fixed:       { bg: '#052e16', color: '#4ade80' },
  reopened:    { bg: '#450a0a', color: '#f87171' },
} as const

type VulnStatusKey = keyof typeof VULN_STATUS_CONFIG

function VulnStatusBadge({ status }: { status: string }) {
  const cfg = VULN_STATUS_CONFIG[status as VulnStatusKey] ?? VULN_STATUS_CONFIG.open
  const label = VULN_STATUS_LABELS[status as VulnStatusKey] ?? status
  return (
    <span
      className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {label}
    </span>
  )
}

export default function VulnerabilityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { canEdit } = useRole()
  const searchParams = useSearchParams()
  const [editing, setEditing] = useState(searchParams.get('mode') === 'edit')

  const { data: vulnData, isLoading } = useGetVulnerabilityV1VulnerabilitiesVulnIdGet(id)

  const vulnerability = (vulnData as any)?.data?.data

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#a78bfa] border-t-transparent" />
      </div>
    )
  }

  if (!vulnerability) {
    return <p className="text-[#71717a]">Уязвимость не найдена</p>
  }

  if (editing && canEdit) {
    return (
      <PageContainer
        title="Редактирование уязвимости"
        action={
          <Button
            variant="outline"
            onClick={() => setEditing(false)}
            className="border-[#27272a] text-[#71717a]"
          >
            Отмена
          </Button>
        }
      >
        <VulnerabilityForm
          defaultValues={{
            name: vulnerability.name,
            description: vulnerability.description ?? '',
            status: vulnerability.status as VulnerabilityStatus,
            severity: vulnerability.severity,
            location_id: vulnerability.location_id,
            discovered_at: vulnerability.discovered_at
              ? new Date(vulnerability.discovered_at).toISOString().slice(0, 16)
              : '',
          }}
          vulnId={id}
        />
      </PageContainer>
    )
  }

  return (
    <PageContainer
      title={vulnerability.name}
      action={
        canEdit ? (
          <Button
            onClick={() => setEditing(true)}
            className="bg-[#7c3aed] text-white hover:bg-[#6d28d9]"
          >
            Редактировать
          </Button>
        ) : null
      }
    >
      <div className="rounded-xl border border-[#27272a] bg-[#18181b] p-6 space-y-4">
        <div className="flex items-center gap-4">
          <VulnStatusBadge status={vulnerability.status} />
          <ThreatIndicator level={vulnerability.severity} />
        </div>

        {vulnerability.description && (
          <p className="text-sm text-[#fafafa]">{vulnerability.description}</p>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-[#71717a]">Обнаружена: </span>
            <span className="text-[#fafafa]">
              {format(new Date(vulnerability.discovered_at), 'dd MMM yyyy, HH:mm', { locale: ru })}
            </span>
          </div>
          {vulnerability.resolved_at && (
            <div>
              <span className="text-[#71717a]">Устранена: </span>
              <span className="text-[#fafafa]">
                {format(new Date(vulnerability.resolved_at), 'dd MMM yyyy, HH:mm', { locale: ru })}
              </span>
            </div>
          )}
          <div>
            <span className="text-[#71717a]">Локация: </span>
            <span className="text-[#fafafa]">{vulnerability.location?.name ?? '-'}</span>
          </div>
          <div>
            <span className="text-[#71717a]">Серьёзность: </span>
            <span className="text-[#fafafa]">{vulnerability.severity} / 5</span>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
