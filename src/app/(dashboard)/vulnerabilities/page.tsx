'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PageContainer } from '@/components/layout/PageContainer'
import { VulnerabilityTable } from '@/components/vulnerabilities/VulnerabilityTable'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { useRole } from '@/hooks/useRole'
import {
  useListVulnerabilitiesV1VulnerabilitiesGet,
  useDeleteVulnerabilityV1VulnerabilitiesVulnIdDelete,
} from '@/api/generated/vulnerabilities/vulnerabilities'

export default function VulnerabilitiesPage() {
  const { canViewVulnerabilities, canEdit, canDelete } = useRole()
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data, isLoading } = useListVulnerabilitiesV1VulnerabilitiesGet()
  const deleteMutation = useDeleteVulnerabilityV1VulnerabilitiesVulnIdDelete()

  const vulnerabilities = (data as any)?.data?.data ?? []

  if (!canViewVulnerabilities) {
    return <EmptyState message="Недостаточно прав для просмотра уязвимостей" />
  }

  function handleDelete() {
    if (!deleteId) return
    deleteMutation.mutate(
      { vulnId: deleteId },
      { onSuccess: () => setDeleteId(null) }
    )
  }

  return (
    <PageContainer
      title="Уязвимости"
      action={
        <Link
          href="/vulnerabilities/new"
          className="inline-flex items-center rounded-lg bg-[#7c3aed] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#6d28d9]"
        >
          Добавить
        </Link>
      }
    >
      <VulnerabilityTable
        data={vulnerabilities}
        isLoading={isLoading}
        onEdit={canEdit ? (id) => router.push(`/vulnerabilities/${id}?mode=edit`) : undefined}
        onDelete={canDelete ? setDeleteId : undefined}
      />
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Удалить уязвимость?"
        description="Действие необратимо. Уязвимость будет удалена из системы."
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </PageContainer>
  )
}
