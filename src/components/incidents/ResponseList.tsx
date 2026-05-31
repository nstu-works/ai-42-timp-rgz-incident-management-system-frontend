'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { axiosInstance } from '@/lib/axios'
import { useQueryClient } from '@tanstack/react-query'
import { useRole } from '@/hooks/useRole'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { getListResponsesV1IncidentsIncidentIdResponsesGetQueryKey } from '@/api/generated/incidents/incidents'

interface IncidentResponse {
  id: string
  action_taken: string
  responded_at: string
  responder_id: string
}

interface ResponseListProps {
  incidentId: string
  responses: IncidentResponse[]
}

const responseSchema = z.object({
  action_taken: z.string().min(1, 'Опишите меру').max(1000),
  responded_at: z.string().min(1),
})
type ResponseFormValues = z.infer<typeof responseSchema>

export function ResponseList({ incidentId, responses }: ResponseListProps) {
  const { isAdmin, isOperator } = useRole()
  const canAdd = isAdmin || isOperator
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const form = useForm<ResponseFormValues>({
    resolver: zodResolver(responseSchema),
    defaultValues: {
      action_taken: '',
      responded_at: new Date().toISOString().slice(0, 16),
    },
  })

  async function onSubmit(values: ResponseFormValues) {
    setError(null)
    try {
      await axiosInstance.post(`/v1/incidents/${incidentId}/responses`, values)
      await queryClient.invalidateQueries({
        queryKey: getListResponsesV1IncidentsIncidentIdResponsesGetQueryKey(incidentId),
      })
      form.reset()
      setAdding(false)
    } catch {
      setError('Ошибка при добавлении меры')
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-[#fafafa]">Меры реагирования</h3>
        {canAdd && !adding && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setAdding(true)}
            className="border-[#27272a] text-[#71717a] hover:text-[#fafafa]"
          >
            Добавить
          </Button>
        )}
      </div>

      {adding && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
            <FormField
              control={form.control}
              name="action_taken"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Опишите принятые меры..."
                      className="border-[#27272a] bg-[#09090b] text-[#fafafa]"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <div className="flex gap-2">
              <Button
                type="submit"
                size="sm"
                disabled={form.formState.isSubmitting}
                className="bg-[#7c3aed] text-white hover:bg-[#6d28d9]"
              >
                Сохранить
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setAdding(false)}
                className="border-[#27272a] text-[#71717a]"
              >
                Отмена
              </Button>
            </div>
          </form>
        </Form>
      )}

      {responses.length === 0 ? (
        <p className="text-sm text-[#71717a]">Мер реагирования нет</p>
      ) : (
        <div className="space-y-2">
          {responses.map((r) => (
            <div
              key={r.id}
              className="rounded-lg border border-[#27272a] bg-[#09090b] p-3"
            >
              <p className="text-sm text-[#fafafa]">{r.action_taken}</p>
              <p className="mt-1 text-xs text-[#71717a]">
                {format(new Date(r.responded_at), 'dd MMM yyyy, HH:mm', { locale: ru })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
