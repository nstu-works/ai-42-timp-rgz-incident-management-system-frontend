'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { locationTypeSchema, type LocationTypeFormValues } from '@/schemas/location'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  useCreateLocationTypeV1LocationTypesPost,
  useUpdateLocationTypeV1LocationTypesLtIdPatch,
} from '@/api/generated/location-types/location-types'
import type {
  LocationTypeCreate,
  LocationTypeUpdate,
} from '@/api/generated/iMSIncidentManagementSystem.schemas'

interface LocationTypeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing?: { id: string; name: string }
  onSuccess: () => void
}

export function LocationTypeModal({
  open,
  onOpenChange,
  editing,
  onSuccess,
}: LocationTypeModalProps) {
  const [error, setError] = useState<string | null>(null)

  const createMutation = useCreateLocationTypeV1LocationTypesPost()
  const updateMutation = useUpdateLocationTypeV1LocationTypesLtIdPatch()

  const form = useForm<LocationTypeFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(locationTypeSchema) as any,
    defaultValues: { name: '' },
  })

  useEffect(() => {
    if (open) {
      form.reset({ name: editing?.name ?? '' })
      setError(null)
    }
  }, [open, editing, form])

  async function onSubmit(values: LocationTypeFormValues) {
    setError(null)
    try {
      if (editing) {
        const updateData: LocationTypeUpdate = { name: values.name }
        await updateMutation.mutateAsync({ ltId: editing.id, data: updateData })
      } else {
        const createData: LocationTypeCreate = { name: values.name }
        await createMutation.mutateAsync({ data: createData })
      }
      toast.success(editing ? 'Тип локации сохранён' : 'Тип локации создан')
      onSuccess()
      onOpenChange(false)
    } catch {
      setError('Не удалось сохранить тип локации')
      toast.error('Ошибка сохранения типа локации')
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[#27272a] bg-[#18181b] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#fafafa]">
            {editing ? 'Редактировать тип локации' : 'Добавить тип локации'}
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
                      placeholder="Название типа"
                      className="border-[#27272a] bg-[#09090b] text-[#fafafa] placeholder:text-[#71717a]"
                      {...field}
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
