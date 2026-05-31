'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ColumnDef } from '@tanstack/react-table'
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const locations = (locsData as any)?.data ?? []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const locationTypes = (typesData as any)?.data ?? []

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
        <div className="flex gap-2">
          {isAdmin && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="text-[#a78bfa] hover:text-[#c4b5fd]"
                onClick={() => openEditType(row.original)}
              >
                Изменить
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-400 hover:text-red-300"
                onClick={() => setDeleteTypeId(row.original.id)}
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
      title="Локации"
      action={
        isAdmin ? (
          <Link
            href="/locations/new"
            className="inline-flex items-center rounded-lg bg-[#7c3aed] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#6d28d9]"
          >
            Добавить локацию
          </Link>
        ) : null
      }
    >
      <Tabs defaultValue="locations">
        <TabsList className="mb-4">
          <TabsTrigger value="locations">Локации</TabsTrigger>
          <TabsTrigger value="types">Типы локаций</TabsTrigger>
        </TabsList>

        <TabsContent value="locations">
          <LocationTable
            data={locations}
            isLoading={locsLoading}
            onDelete={isAdmin ? setDeleteLocId : undefined}
          />
        </TabsContent>

        <TabsContent value="types">
          <div className="space-y-4">
            {isAdmin && (
              <div className="flex justify-end">
                <Button
                  onClick={openAddType}
                  className="bg-[#7c3aed] text-white hover:bg-[#6d28d9]"
                >
                  Добавить тип
                </Button>
              </div>
            )}
            <DataTable
              columns={typeColumns}
              data={locationTypes}
              isLoading={typesLoading}
              emptyMessage="Типов локаций нет"
            />
          </div>
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
