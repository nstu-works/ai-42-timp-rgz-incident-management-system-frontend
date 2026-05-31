'use client'

import { useRef, useState } from 'react'
import { axiosInstance, BASE_URL } from '@/lib/axios'
import { Button } from '@/components/ui/button'
import { useQueryClient } from '@tanstack/react-query'
import { useRole } from '@/hooks/useRole'
import { getListPhotosV1IncidentsIncidentIdPhotosGetQueryKey } from '@/api/generated/incidents/incidents'

interface Photo {
  id: string
  uploaded_at: string
}

interface PhotoUploadProps {
  incidentId: string
  photos: Photo[]
}

export function PhotoUpload({ incidentId, photos }: PhotoUploadProps) {
  const { canCreate, canDelete } = useRole()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    const form = new FormData()
    form.append('file', file)
    try {
      await axiosInstance.post(`/v1/incidents/${incidentId}/photos`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      await queryClient.invalidateQueries({
        queryKey: getListPhotosV1IncidentsIncidentIdPhotosGetQueryKey(incidentId),
      })
    } catch {
      setError('Ошибка загрузки файла')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function handleDelete(photoId: string) {
    try {
      await axiosInstance.delete(`/v1/incidents/${incidentId}/photos/${photoId}`)
      await queryClient.invalidateQueries({
        queryKey: getListPhotosV1IncidentsIncidentIdPhotosGetQueryKey(incidentId),
      })
    } catch {
      setError('Ошибка удаления фото')
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-[#fafafa]">Фотографии</h3>
        {canCreate && (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="border-[#27272a] text-[#71717a] hover:text-[#fafafa]"
            >
              {uploading ? 'Загрузка...' : 'Добавить фото'}
            </Button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
            />
          </>
        )}
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      {photos.length === 0 ? (
        <p className="text-sm text-[#71717a]">Фотографий нет</p>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {photos.map((photo) => (
            <div key={photo.id} className="group relative">
              <img
                src={`${BASE_URL}/v1/incidents/${incidentId}/photos/${photo.id}/file`}
                alt="Фото инцидента"
                className="h-32 w-full rounded object-cover border border-[#27272a]"
              />
              {canDelete && (
                <button
                  onClick={() => handleDelete(photo.id)}
                  className="absolute right-1 top-1 hidden rounded bg-red-900/80 px-1.5 py-0.5 text-xs text-red-300 group-hover:block"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
