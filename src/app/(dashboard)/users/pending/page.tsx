// src/app/(dashboard)/users/pending/page.tsx
'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { PageContainer } from '@/components/layout/PageContainer'
import { EmptyState } from '@/components/shared/EmptyState'
import { useRole } from '@/hooks/useRole'
import {
  useListUsersV1UsersGet,
  getGetGuestCountV1UsersGuestCountGetQueryKey,
  useApproveUserV1UsersUserIdApprovePost,
} from '@/api/generated/users/users'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const ROLE_OPTIONS = [
  { value: 'guard', label: 'Охранник' },
  { value: 'operator', label: 'Оператор' },
  { value: 'analyst', label: 'Аналитик' },
  { value: 'admin', label: 'Администратор' },
]

export default function PendingUsersPage() {
  const { isAdmin } = useRole()
  const queryClient = useQueryClient()
  const [selectedRoles, setSelectedRoles] = useState<Record<string, string>>({})

  const { data, isLoading, refetch } = useListUsersV1UsersGet()
  const approveMutation = useApproveUserV1UsersUserIdApprovePost()

  const allUsers = (data as any)?.data?.data ?? []
  const guests = allUsers.filter((u: any) => u.role === 'guest')

  if (!isAdmin) {
    return <EmptyState message="Недостаточно прав для просмотра заявок" />
  }

  function handleApprove(userId: string) {
    const role = selectedRoles[userId]
    if (!role) return
    approveMutation.mutate(
      { userId, data: { role } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: getGetGuestCountV1UsersGuestCountGetQueryKey(),
          })
          refetch()
          setSelectedRoles((prev) => {
            const next = { ...prev }
            delete next[userId]
            return next
          })
        },
      }
    )
  }

  return (
    <PageContainer title="Заявки на вступление">
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#a78bfa] border-t-transparent" />
        </div>
      ) : guests.length === 0 ? (
        <EmptyState message="Нет ожидающих заявок" />
      ) : (
        <div className="space-y-3">
          {guests.map((user: any) => (
            <div
              key={user.id}
              className="flex items-center justify-between rounded-lg border border-[#27272a] bg-[#18181b] p-4"
            >
              <div>
                <p className="font-medium text-[#fafafa]">
                  {user.last_name} {user.first_name}
                  {user.surname ? ` ${user.surname}` : ''}
                </p>
                <p className="text-sm text-[#71717a]">{user.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <Select
                  value={selectedRoles[user.id] ?? ''}
                  onValueChange={(v) =>
                    setSelectedRoles((prev) => ({ ...prev, [user.id]: v }))
                  }
                >
                  <SelectTrigger className="w-40 border-[#27272a] bg-[#09090b] text-[#fafafa]">
                    <SelectValue placeholder="Выбрать роль" />
                  </SelectTrigger>
                  <SelectContent className="border-[#27272a] bg-[#18181b]">
                    {ROLE_OPTIONS.map((opt) => (
                      <SelectItem
                        key={opt.value}
                        value={opt.value}
                        className="text-[#fafafa] focus:bg-[#27272a]"
                      >
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => handleApprove(user.id)}
                  disabled={!selectedRoles[user.id] || approveMutation.isPending}
                  className="bg-[#7c3aed] text-white hover:bg-[#6d28d9] disabled:opacity-50"
                >
                  Подтвердить
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  )
}
