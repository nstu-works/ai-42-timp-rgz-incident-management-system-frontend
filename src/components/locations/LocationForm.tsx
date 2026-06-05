'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { locationSchema, type LocationFormValues } from '@/schemas/location'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'
import { ErrorAlert } from '@/components/shared/ErrorAlert'
import {
  useCreateLocationV1LocationsPost,
  useUpdateLocationV1LocationsLocIdPatch,
  getListLocationsV1LocationsGetQueryKey,
  getGetLocationV1LocationsLocIdGetQueryKey,
} from '@/api/generated/locations/locations'
import { useListLocationTypesV1LocationTypesGet } from '@/api/generated/location-types/location-types'
import type { LocationCreate, LocationUpdate } from '@/api/generated/iMSIncidentManagementSystem.schemas'

interface LocationFormProps {
  defaultValues?: Partial<LocationFormValues>
  locationId?: string
}

export function LocationForm({ defaultValues, locationId }: LocationFormProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const createMutation = useCreateLocationV1LocationsPost()
  const updateMutation = useUpdateLocationV1LocationsLocIdPatch()

  const { data: locationTypesData } = useListLocationTypesV1LocationTypesGet()
  const locationTypes = (locationTypesData as any)?.data?.data ?? []

  const form = useForm<LocationFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(locationSchema) as any,
    defaultValues: {
      name: '',
      location_type_id: '',
      address: '',
      ...defaultValues,
    },
  })

  async function onSubmit(values: LocationFormValues) {
    setError(null)
    try {
      if (locationId) {
        const updateData: LocationUpdate = {
          name: values.name,
          location_type_id: values.location_type_id,
          address: values.address ?? null,
        }
        await updateMutation.mutateAsync({ locId: locationId, data: updateData })
        await queryClient.invalidateQueries({ queryKey: getListLocationsV1LocationsGetQueryKey() })
        await queryClient.invalidateQueries({ queryKey: getGetLocationV1LocationsLocIdGetQueryKey(locationId) })
        toast.success('Локация сохранена')
        router.push(`/locations/${locationId}`)
        return
      } else {
        const createData: LocationCreate = {
          name: values.name,
          location_type_id: values.location_type_id,
          address: values.address ?? null,
        }
        await createMutation.mutateAsync({ data: createData })
        await queryClient.invalidateQueries({ queryKey: getListLocationsV1LocationsGetQueryKey() })
        toast.success('Локация создана')
      }
      router.push('/locations')
    } catch {
      setError('Не удалось сохранить локацию')
      toast.error('Ошибка сохранения локации')
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <ErrorAlert message={error ?? undefined} />

        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#fafafa]">Название</FormLabel>
              <FormControl>
                <Input
                  placeholder="Название локации"
                  className="border-[#27272a] bg-[#18181b] text-[#fafafa] placeholder:text-[#71717a]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Location Type */}
        <FormField
          control={form.control}
          name="location_type_id"
          render={({ field }) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const selected = locationTypes.find((lt: any) => lt.id === field.value)
            return (
              <FormItem>
                <FormLabel className="text-[#fafafa]">Тип локации</FormLabel>
                <Select value={field.value ?? ''} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="border-[#27272a] bg-[#18181b] text-[#fafafa]">
                      <span className={`flex-1 text-left text-sm ${!selected ? 'text-[#71717a]' : ''}`}>
                        {selected ? selected.name : 'Выберите тип'}
                      </span>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="border-[#27272a] bg-[#18181b]">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {locationTypes.map((lt: any) => (
                      <SelectItem
                        key={lt.id}
                        value={lt.id}
                        className="text-[#fafafa] focus:bg-[#27272a]"
                      >
                        {lt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )
          }}
        />

        {/* Address */}
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#fafafa]">Адрес</FormLabel>
              <FormControl>
                <Input
                  placeholder="Адрес (необязательно)"
                  className="border-[#27272a] bg-[#18181b] text-[#fafafa] placeholder:text-[#71717a]"
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            disabled={isPending}
            className="bg-[#7c3aed] text-white hover:bg-[#6d28d9]"
          >
            {isPending ? 'Сохранение…' : locationId ? 'Сохранить' : 'Создать'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/locations')}
            className="border-[#27272a] bg-transparent text-[#a1a1aa] hover:bg-[#27272a] hover:text-[#fafafa]"
          >
            Отмена
          </Button>
        </div>
      </form>
    </Form>
  )
}
