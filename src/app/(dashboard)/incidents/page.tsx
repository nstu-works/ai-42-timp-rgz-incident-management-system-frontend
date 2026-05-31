'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PageContainer } from '@/components/layout/PageContainer'
import { IncidentTable } from '@/components/incidents/IncidentTable'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { useRole } from '@/hooks/useRole'
import {
  useListIncidentsV1IncidentsGet,
  useDeleteIncidentV1IncidentsIncidentIdDelete,
} from '@/api/generated/incidents/incidents'

export default function IncidentsPage() {
  const { isGuard, canEdit, canDelete } = useRole()
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data, isLoading } = useListIncidentsV1IncidentsGet()
  const deleteMutation = useDeleteIncidentV1IncidentsIncidentIdDelete()

  const incidents = (data as any)?.data?.data ?? []

  function handleDelete() {
    if (!deleteId) return
    deleteMutation.mutate(
      { incidentId: deleteId },
      { onSuccess: () => setDeleteId(null) }
    )
  }

  return (
    <PageContainer
      title="Инциденты"
      action={
        <Link
          href="/incidents/new"
          className="inline-flex items-center rounded-lg bg-[#7c3aed] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#6d28d9]"
        >
          Добавить
        </Link>
      }
    >
      <IncidentTable
        data={incidents}
        isLoading={isLoading}
        onEdit={canEdit ? (id) => router.push(`/incidents/${id}?mode=edit`) : undefined}
        onDelete={canDelete ? setDeleteId : undefined}
      />
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Удалить инцидент?"
        description="Действие необратимо. Удаление доступно только для закрытых инцидентов."
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </PageContainer>
  )
}
