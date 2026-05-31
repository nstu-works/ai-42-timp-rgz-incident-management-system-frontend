'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ColumnDef } from '@tanstack/react-table'
import { Pencil, Trash2 } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { LocationTable } from '@/components/locations/LocationTable'
import { LocationTypeModal } from '@/components/locations/LocationTypeModal'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { DataTable } from '@/components/shared/DataTable'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useRole } from '@/hooks/useRole'
import {
  useListLocationsV1LocationsGet,
  useDeleteLocationV1LocationsLocIdDelete,
} from '@/api/generated/locations/locations'
import {
  useListLocationTypesV1LocationTypesGet,
  useDeleteLocationTypeV1LocationTypesLtIdDelete,
} from '@/api/generated/location-types/location-types'

interface LocationTypeRow {
  id: string
  name: string
}

export default function LocationsPage() {
  const { isAdmin } = useRole()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<'locations' | 'types'>('locations')

  // Locations state
  const [deleteLocId, setDeleteLocId] = useState<string | null>(null)

  // Location Types state
  const [typeModalOpen, setTypeModalOpen] = useState(false)
  const [editingType, setEditingType] = useState<{ id: string; name: string } | undefined>(
    undefined
  )
  const [deleteTypeId, setDeleteTypeId] = useState<string | null>(null)

  const { data: locsData, isLoading: locsLoading, refetch: refetchLocs } = useListLocationsV1LocationsGet()
  const { data: typesData, isLoading: typesLoading, refetch: refetchTypes } = useListLocationTypesV1LocationTypesGet()

  const deleteLocMutation = useDeleteLocationV1LocationsLocIdDelete()
  const deleteTypeMutation = useDeleteLocationTypeV1LocationTypesLtIdDelete()

  const locations = (locsData as any)?.data?.data ?? []
  const locationTypes = (typesData as any)?.data?.data ?? []

  function handleDeleteLoc() {
    if (!deleteLocId) return
    deleteLocMutation.mutate(
      { locId: deleteLocId },
      {
        onSuccess: () => {
          setDeleteLocId(null)
          refetchLocs()
        },
      }
    )
  }

  function handleDeleteType() {
    if (!deleteTypeId) return
    deleteTypeMutation.mutate(
      { ltId: deleteTypeId },
      {
        onSuccess: () => {
          setDeleteTypeId(null)
          refetchTypes()
        },
      }
    )
  }

  function openAddType() {
    setEditingType(undefined)
    setTypeModalOpen(true)
  }

  function openEditType(lt: LocationTypeRow) {
    setEditingType({ id: lt.id, name: lt.name })
    setTypeModalOpen(true)
  }

  const typeColumns: ColumnDef<LocationTypeRow>[] = [
    {
      accessorKey: 'name',
      header: 'Название',
      cell: ({ row }) => <span className="text-[#fafafa]">{row.getValue('name')}</span>,
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          {isAdmin && (
            <>
              <Button
                variant="ghost"
                size="icon-sm"
                title="Редактировать"
                className="border border-[#27272a] text-[#a78bfa] hover:bg-[#27272a] hover:text-[#c4b5fd]"
                onClick={() => openEditType(row.original)}
              >
                <Pencil className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                title="Удалить"
                className="border border-[#27272a] text-red-400 hover:bg-[#27272a] hover:text-red-300"
                onClick={() => setDeleteTypeId(row.original.id)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ]

  const action = isAdmin ? (
    activeTab === 'locations' ? (
      <Link
        href="/locations/new"
        className="inline-flex items-center rounded-lg bg-[#7c3aed] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#6d28d9]"
      >
        Добавить
      </Link>
    ) : (
      <button
        onClick={openAddType}
        className="inline-flex items-center rounded-lg bg-[#7c3aed] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#6d28d9]"
      >
        Добавить
      </button>
    )
  ) : null

  return (
    <PageContainer title="Локации" action={action}>
      <Tabs
        defaultValue="locations"
        onValueChange={(v) => setActiveTab(v as 'locations' | 'types')}
      >
        <TabsList className="mb-4">
          <TabsTrigger value="locations">Локации</TabsTrigger>
          <TabsTrigger value="types">Типы локаций</TabsTrigger>
        </TabsList>

        <TabsContent value="locations">
          <LocationTable
            data={locations}
            isLoading={locsLoading}
            onEdit={isAdmin ? (id) => router.push(`/locations/${id}?mode=edit`) : undefined}
            onDelete={isAdmin ? setDeleteLocId : undefined}
          />
        </TabsContent>

        <TabsContent value="types">
          <DataTable
            columns={typeColumns}
            data={locationTypes}
            isLoading={typesLoading}
            emptyMessage="Типов локаций нет"
          />
        </TabsContent>
      </Tabs>

      {/* Confirm delete location */}
      <ConfirmDialog
        open={!!deleteLocId}
        onOpenChange={(open) => !open && setDeleteLocId(null)}
        title="Удалить локацию?"
        description="Действие необратимо. Локация будет удалена из системы."
        onConfirm={handleDeleteLoc}
        isLoading={deleteLocMutation.isPending}
      />

      {/* Confirm delete location type */}
      <ConfirmDialog
        open={!!deleteTypeId}
        onOpenChange={(open) => !open && setDeleteTypeId(null)}
        title="Удалить тип локации?"
        description="Действие необратимо. Тип локации будет удалён из системы."
        onConfirm={handleDeleteType}
        isLoading={deleteTypeMutation.isPending}
      />

      {/* Location type modal */}
      <LocationTypeModal
        open={typeModalOpen}
        onOpenChange={setTypeModalOpen}
        editing={editingType}
        onSuccess={() => refetchTypes()}
      />
    </PageContainer>
  )
}
