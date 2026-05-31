'use client'

import { PageContainer } from '@/components/layout/PageContainer'
import { UserForm } from '@/components/users/UserForm'
import { EmptyState } from '@/components/shared/EmptyState'
import { useRole } from '@/hooks/useRole'

export default function NewUserPage() {
  const { isAdmin } = useRole()

  if (!isAdmin) {
    return <EmptyState message="Недостаточно прав для создания пользователей" />
  }

  return (
    <PageContainer title="Новый пользователь">
      <UserForm />
    </PageContainer>
  )
}
