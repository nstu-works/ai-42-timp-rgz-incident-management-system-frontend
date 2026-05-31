'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { categorySchema, type CategoryFormValues } from '@/schemas/category'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { ErrorAlert } from '@/components/shared/ErrorAlert'
import {
  useCreateCategoryV1CategoriesPost,
  useUpdateCategoryV1CategoriesCatIdPatch,
} from '@/api/generated/categories/categories'
import type {
  CategoryCreate,
  CategoryUpdate,
} from '@/api/generated/iMSIncidentManagementSystem.schemas'

interface CategoryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing?: { id: string; name: string; description?: string | null }
  onSuccess: () => void
}

export function CategoryModal({
  open,
  onOpenChange,
  editing,
  onSuccess,
}: CategoryModalProps) {
  const [error, setError] = useState<string | null>(null)

  const createMutation = useCreateCategoryV1CategoriesPost()
  const updateMutation = useUpdateCategoryV1CategoriesCatIdPatch()

  const form = useForm<CategoryFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(categorySchema) as any,
    defaultValues: { name: '', description: '' },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        name: editing?.name ?? '',
        description: editing?.description ?? '',
      })
      setError(null)
    }
  }, [open, editing, form])

  async function onSubmit(values: CategoryFormValues) {
    setError(null)
    try {
      if (editing) {
        const updateData: CategoryUpdate = {
          name: values.name,
          description: values.description ?? null,
        }
        await updateMutation.mutateAsync({ catId: editing.id, data: updateData })
      } else {
        const createData: CategoryCreate = {
          name: values.name,
          description: values.description ?? null,
        }
        await createMutation.mutateAsync({ data: createData })
      }
      toast.success(editing ? 'Категория сохранена' : 'Категория создана')
      onSuccess()
      onOpenChange(false)
    } catch {
      setError('Не удалось сохранить категорию')
      toast.error('Ошибка сохранения категории')
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[#27272a] bg-[#18181b] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#fafafa]">
            {editing ? 'Редактировать категорию' : 'Добавить категорию'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ErrorAlert message={error ?? undefined} />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#fafafa]">Название</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Название категории"
                      className="border-[#27272a] bg-[#09090b] text-[#fafafa] placeholder:text-[#71717a]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#fafafa]">Описание</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Описание категории"
                      rows={3}
                      className="border-[#27272a] bg-[#09090b] text-[#fafafa] placeholder:text-[#71717a]"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-[#7c3aed] text-white hover:bg-[#6d28d9]"
              >
                {isPending ? 'Сохранение…' : 'Сохранить'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
