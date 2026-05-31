'use client'

import { use, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { PageContainer } from '@/components/layout/PageContainer'
import { StatusBadge } from '@/components/incidents/StatusBadge'
import { ThreatIndicator } from '@/components/incidents/ThreatIndicator'
import { PhotoUpload } from '@/components/incidents/PhotoUpload'
import { ResponseList } from '@/components/incidents/ResponseList'
import { IncidentForm } from '@/components/incidents/IncidentForm'
import { Button } from '@/components/ui/button'
import { useRole } from '@/hooks/useRole'
import { ROLE_LABELS } from '@/schemas/user'
import {
  useGetIncidentV1IncidentsIncidentIdGet,
  useListPhotosV1IncidentsIncidentIdPhotosGet,
  useListResponsesV1IncidentsIncidentIdResponsesGet,
} from '@/api/generated/incidents/incidents'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

export default function IncidentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { canEdit, canViewVulnerabilities } = useRole()
  const searchParams = useSearchParams()
  const [editing, setEditing] = useState(searchParams.get('mode') === 'edit')

  const { data: incidentData, isLoading } = useGetIncidentV1IncidentsIncidentIdGet(id)
  const { data: photosData } = useListPhotosV1IncidentsIncidentIdPhotosGet(id)
  const { data: responsesData } = useListResponsesV1IncidentsIncidentIdResponsesGet(id)

  const incident = (incidentData as any)?.data?.data
  const photos = (photosData as any)?.data?.data ?? []
  const responses = (responsesData as any)?.data?.data ?? []

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#a78bfa] border-t-transparent" />
      </div>
    )
  }

  if (!incident) {
    return <p className="text-[#71717a]">Инцидент не найден</p>
  }

  if (editing && canEdit) {
    return (
      <PageContainer
        title="Редактирование инцидента"
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
        <IncidentForm defaultValues={incident} incidentId={id} />
      </PageContainer>
    )
  }

  return (
    <PageContainer
      title={incident.title}
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
      <div className="space-y-6">
        <div className="rounded-xl border border-[#27272a] bg-[#18181b] p-6 space-y-4">
          <div className="flex items-center gap-4">
            <StatusBadge status={incident.status} />
            <ThreatIndicator level={incident.threat_level} />
          </div>
          {incident.description && (
            <p className="text-sm text-[#fafafa]">{incident.description}</p>
          )}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-[#71717a]">Дата: </span>
              <span className="text-[#fafafa]">
                {format(new Date(incident.occurred_at), 'dd MMM yyyy, HH:mm', { locale: ru })}
              </span>
            </div>
            <div>
              <span className="text-[#71717a]">Создан: </span>
              <span className="text-[#fafafa]">
                {format(new Date(incident.created_at), 'dd MMM yyyy', { locale: ru })}
              </span>
            </div>
            <div>
              <span className="text-[#71717a]">Локация: </span>
              <span className="text-[#fafafa]">{incident.location?.name ?? '—'}</span>
            </div>
            <div>
              <span className="text-[#71717a]">Категория: </span>
              <span className="text-[#fafafa]">{incident.category?.name ?? '—'}</span>
            </div>
            <div>
              <span className="text-[#71717a]">Репортировал: </span>
              <span className="text-[#fafafa]">
                {incident.reporter
                  ? [incident.reporter.first_name, incident.reporter.last_name].filter(Boolean).join(' ')
                  : '—'}
                {incident.reporter?.role && (
                  <span className="ml-1 text-[#71717a]">
                    ({ROLE_LABELS[incident.reporter.role as keyof typeof ROLE_LABELS] ?? incident.reporter.role})
                  </span>
                )}
              </span>
            </div>
            <div>
              <span className="text-[#71717a]">Назначен: </span>
              <span className="text-[#fafafa]">
                {incident.assignee
                  ? [incident.assignee.first_name, incident.assignee.last_name].filter(Boolean).join(' ')
                  : 'Не назначен'}
              </span>
            </div>
            {canViewVulnerabilities && (
              <div className="col-span-2">
                <span className="text-[#71717a]">Уязвимость: </span>
                <span className="text-[#fafafa]">{incident.vulnerability?.name ?? 'Не указана'}</span>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-[#27272a] bg-[#18181b] p-6">
          <PhotoUpload incidentId={id} photos={photos} />
        </div>

        <div className="rounded-xl border border-[#27272a] bg-[#18181b] p-6">
          <ResponseList incidentId={id} responses={responses} />
        </div>
      </div>
    </PageContainer>
  )
}
