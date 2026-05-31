'use client'

import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { PageContainer } from '@/components/layout/PageContainer'
import { DataTable } from '@/components/shared/DataTable'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { CategoryModal } from '@/components/categories/CategoryModal'
import { Button } from '@/components/ui/button'
import { useRole } from '@/hooks/useRole'
import {
  useListCategoriesV1CategoriesGet,
  useDeleteCategoryV1CategoriesCatIdDelete,
} from '@/api/generated/categories/categories'

interface CategoryRow {
  id: string
  name: string
  description?: string | null
}

export default function CategoriesPage() {
  const { isAdmin } = useRole()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<
    { id: string; name: string; description?: string | null } | undefined
  >(undefined)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data, isLoading, refetch } = useListCategoriesV1CategoriesGet()
  const deleteMutation = useDeleteCategoryV1CategoriesCatIdDelete()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const categories: CategoryRow[] = (data as any)?.data ?? []

  function handleDelete() {
    if (!deleteId) return
    deleteMutation.mutate(
      { catId: deleteId },
      {
        onSuccess: () => {
          setDeleteId(null)
          refetch()
        },
      }
    )
  }

  function openAdd() {
    setEditingCategory(undefined)
    setModalOpen(true)
  }

  function openEdit(cat: CategoryRow) {
    setEditingCategory({ id: cat.id, name: cat.name, description: cat.description })
    setModalOpen(true)
  }

  const columns: ColumnDef<CategoryRow>[] = [
    {
      accessorKey: 'name',
      header: 'Название',
      cell: ({ row }) => (
        <span className="font-medium text-[#fafafa]">{row.getValue('name')}</span>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Описание',
      cell: ({ row }) => (
        <span className="text-[#a1a1aa]">{row.getValue('description') ?? '—'}</span>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          {isAdmin && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="text-[#a78bfa] hover:text-[#c4b5fd]"
                onClick={() => openEdit(row.original)}
              >
                Изменить
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-400 hover:text-red-300"
                onClick={() => setDeleteId(row.original.id)}
              >
                Удалить
              </Button>
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <PageContainer
      title="Категории"
      action={
        isAdmin ? (
          <Button
            onClick={openAdd}
            className="bg-[#7c3aed] text-white hover:bg-[#6d28d9]"
          >
            Добавить
          </Button>
        ) : null
      }
    >
      <DataTable
        columns={columns}
        data={categories}
        isLoading={isLoading}
        emptyMessage="Категорий нет"
      />

      <CategoryModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        editing={editingCategory}
        onSuccess={() => refetch()}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Удалить категорию?"
        description="Действие необратимо. Категория будет удалена из системы."
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </PageContainer>
  )
}
