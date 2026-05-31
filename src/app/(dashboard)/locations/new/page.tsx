'use client'

import { PageContainer } from '@/components/layout/PageContainer'
import { LocationForm } from '@/components/locations/LocationForm'
import { useRole } from '@/hooks/useRole'
import { EmptyState } from '@/components/shared/EmptyState'

export default function NewLocationPage() {
  const { isAdmin } = useRole()

  if (!isAdmin) {
    return <EmptyState message="Недостаточно прав для создания локации" />
  }

  return (
    <PageContainer title="Новая локация">
      <LocationForm />
    </PageContainer>
  )
}
