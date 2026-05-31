'use client'

import { PageContainer } from '@/components/layout/PageContainer'
import { IncidentForm } from '@/components/incidents/IncidentForm'
import { useRole } from '@/hooks/useRole'
import { EmptyState } from '@/components/shared/EmptyState'

export default function NewIncidentPage() {
  const { canCreate } = useRole()

  if (!canCreate) {
    return <EmptyState message="Недостаточно прав для создания инцидента" />
  }

  return (
    <PageContainer title="Новый инцидент">
      <IncidentForm />
    </PageContainer>
  )
}
