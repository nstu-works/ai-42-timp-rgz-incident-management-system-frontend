'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PageContainer } from '@/components/layout/PageContainer'
import { UserTable } from '@/components/users/UserTable'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { useRole } from '@/hooks/useRole'
import {
  useListUsersV1UsersGet,
  useDeleteUserV1UsersUserIdDelete,
} from '@/api/generated/users/users'

export default function UsersPage() {
  const { canViewUsers, isAdmin } = useRole()
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data, isLoading, refetch } = useListUsersV1UsersGet()
  const deleteMutation = useDeleteUserV1UsersUserIdDelete()

  const users = (data as any)?.data?.data ?? []

  if (!canViewUsers) {
    return <EmptyState message="Недостаточно прав для просмотра пользователей" />
  }

  function handleDelete() {
    if (!deleteId) return
    deleteMutation.mutate(
      { userId: deleteId },
      {
        onSuccess: () => {
          setDeleteId(null)
          refetch()
        },
      }
    )
  }

  return (
    <PageContainer
      title="Пользователи"
      action={
        isAdmin ? (
          <Link
            href="/users/new"
            className="inline-flex items-center rounded-lg bg-[#7c3aed] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#6d28d9]"
          >
            Добавить
          </Link>
        ) : null
      }
    >
      <UserTable
        data={users}
        isLoading={isLoading}
        onEdit={isAdmin ? (id) => router.push(`/users/${id}?mode=edit`) : undefined}
        onDelete={isAdmin ? setDeleteId : undefined}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Удалить пользователя?"
        description="Действие необратимо. Пользователь будет удалён из системы."
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </PageContainer>
  )
}
