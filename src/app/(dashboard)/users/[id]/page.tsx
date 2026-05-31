'use client'

import { use, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { PageContainer } from '@/components/layout/PageContainer'
import { UserForm } from '@/components/users/UserForm'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/EmptyState'
import { useRole } from '@/hooks/useRole'
import { useGetUserV1UsersUserIdGet } from '@/api/generated/users/users'
import { ROLE_LABELS } from '@/schemas/user'

export default function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { canViewUsers, isAdmin } = useRole()
  const searchParams = useSearchParams()
  const [editing, setEditing] = useState(searchParams.get('mode') === 'edit')

  const { data: userData, isLoading } = useGetUserV1UsersUserIdGet(id)
  const user = (userData as any)?.data?.data

  if (!canViewUsers) {
    return <EmptyState message="Недостаточно прав для просмотра пользователей" />
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#a78bfa] border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    return <p className="text-[#71717a]">Пользователь не найден</p>
  }

  if (editing && isAdmin) {
    return (
      <PageContainer
        title="Редактирование пользователя"
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
        <UserForm
          defaultValues={{
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            surname: user.surname ?? '',
            role: user.role,
            is_active: user.is_active,
            password: '',
          }}
          userId={id}
        />
      </PageContainer>
    )
  }

  const fullName = [user.first_name, user.last_name, user.surname].filter(Boolean).join(' ')

  return (
    <PageContainer
      title={fullName}
      action={
        isAdmin ? (
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
          <div>
            <span className="text-[#71717a]">Email: </span>
            <span className="text-[#fafafa]">{user.email}</span>
          </div>
          <div>
            <span className="text-[#71717a]">Роль: </span>
            <span className="text-[#fafafa]">
              {ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] ?? user.role}
            </span>
          </div>
          <div>
            <span className="text-[#71717a]">Активен: </span>
            <span className="text-[#fafafa]">{user.is_active ? 'Да' : 'Нет'}</span>
          </div>
          {user.surname && (
            <div>
              <span className="text-[#71717a]">Отчество: </span>
              <span className="text-[#fafafa]">{user.surname}</span>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  )
}
