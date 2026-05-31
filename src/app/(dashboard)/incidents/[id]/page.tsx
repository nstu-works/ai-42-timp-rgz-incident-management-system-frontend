'use client'

import { use, useState } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { StatusBadge } from '@/components/incidents/StatusBadge'
import { ThreatIndicator } from '@/components/incidents/ThreatIndicator'
import { PhotoUpload } from '@/components/incidents/PhotoUpload'
import { ResponseList } from '@/components/incidents/ResponseList'
import { IncidentForm } from '@/components/incidents/IncidentForm'
import { Button } from '@/components/ui/button'
import { useRole } from '@/hooks/useRole'
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
  const { canEdit } = useRole()
  const [editing, setEditing] = useState(false)

  const { data: incidentData, isLoading } = useGetIncidentV1IncidentsIncidentIdGet(id)
  const { data: photosData } = useListPhotosV1IncidentsIncidentIdPhotosGet(id)
  const { data: responsesData } = useListResponsesV1IncidentsIncidentIdResponsesGet(id)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const incident = (incidentData as any)?.data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const photos = (photosData as any)?.data ?? []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const responses = (responsesData as any)?.data ?? []

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
