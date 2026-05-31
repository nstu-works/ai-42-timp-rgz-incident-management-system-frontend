'use client'

import { use, useState } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { LocationForm } from '@/components/locations/LocationForm'
import { Button } from '@/components/ui/button'
import { useRole } from '@/hooks/useRole'
import { useGetLocationV1LocationsLocIdGet } from '@/api/generated/locations/locations'

export default function LocationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { isAdmin } = useRole()
  const [editing, setEditing] = useState(false)

  const { data: locationData, isLoading } = useGetLocationV1LocationsLocIdGet(id)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const location = (locationData as any)?.data

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#a78bfa] border-t-transparent" />
      </div>
    )
  }

  if (!location) {
    return <p className="text-[#71717a]">Локация не найдена</p>
  }

  if (editing && isAdmin) {
    return (
      <PageContainer
        title="Редактирование локации"
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
        <LocationForm
          defaultValues={{
            name: location.name,
            location_type_id: location.location_type_id,
            address: location.address ?? '',
          }}
          locationId={id}
        />
      </PageContainer>
    )
  }

  return (
    <PageContainer
      title={location.name}
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
        <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <div>
            <span className="text-[#71717a]">Название: </span>
            <span className="text-[#fafafa]">{location.name}</span>
          </div>
          <div>
            <span className="text-[#71717a]">Тип: </span>
            <span className="text-[#fafafa]">{location.location_type?.name ?? '—'}</span>
          </div>
          <div>
            <span className="text-[#71717a]">Адрес: </span>
            <span className="text-[#fafafa]">{location.address ?? '—'}</span>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
