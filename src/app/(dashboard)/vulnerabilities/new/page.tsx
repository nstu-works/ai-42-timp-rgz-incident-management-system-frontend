'use client'

import { PageContainer } from '@/components/layout/PageContainer'
import { VulnerabilityForm } from '@/components/vulnerabilities/VulnerabilityForm'
import { useRole } from '@/hooks/useRole'
import { EmptyState } from '@/components/shared/EmptyState'

export default function NewVulnerabilityPage() {
  const { canCreate } = useRole()

  if (!canCreate) {
    return <EmptyState message="Недостаточно прав для создания уязвимости" />
  }

  return (
    <PageContainer title="Новая уязвимость">
      <VulnerabilityForm />
    </PageContainer>
  )
}
