'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { incidentSchema, type IncidentFormValues, STATUS_LABELS } from '@/schemas/incident'
import { ROLE_LABELS } from '@/schemas/user'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
  useCreateIncidentV1IncidentsPost,
  useUpdateIncidentV1IncidentsIncidentIdPatch,
  getListIncidentsV1IncidentsGetQueryKey,
  getGetIncidentV1IncidentsIncidentIdGetQueryKey,
} from '@/api/generated/incidents/incidents'
import { useListLocationsV1LocationsGet } from '@/api/generated/locations/locations'
import { useListCategoriesV1CategoriesGet } from '@/api/generated/categories/categories'
import { useListUsersV1UsersGet } from '@/api/generated/users/users'
import { useListVulnerabilitiesV1VulnerabilitiesGet } from '@/api/generated/vulnerabilities/vulnerabilities'
import type {
  IncidentCreate,
  IncidentUpdate,
  IncidentStatus,
} from '@/api/generated/iMSIncidentManagementSystem.schemas'

const THREAT_LABELS = ['Минимальный', 'Низкий', 'Средний', 'Высокий', 'Критический']

interface IncidentFormProps {
  defaultValues?: Partial<IncidentFormValues>
  incidentId?: string
}

export function IncidentForm({ defaultValues, incidentId }: IncidentFormProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const createMutation = useCreateIncidentV1IncidentsPost()
  const updateMutation = useUpdateIncidentV1IncidentsIncidentIdPatch()

  const { data: locationsData } = useListLocationsV1LocationsGet()
  const { data: categoriesData } = useListCategoriesV1CategoriesGet()
  const { data: usersData } = useListUsersV1UsersGet()
  const { data: vulnsData } = useListVulnerabilitiesV1VulnerabilitiesGet()

  const locations = (locationsData as any)?.data?.data ?? []
  const categories = (categoriesData as any)?.data?.data ?? []
  const users = (usersData as any)?.data?.data ?? []
  const vulnerabilities = (vulnsData as any)?.data?.data ?? []

  const form = useForm<IncidentFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(incidentSchema) as any,
    defaultValues: {
      title: '',
      description: '',
      status: 'open',
      threat_level: 3,
      location_id: '',
      category_id: '',
      assigned_to: null,
      vulnerability_id: null,
      occurred_at: new Date().toISOString().slice(0, 16),
      ...defaultValues,
    },
  })

  async function onSubmit(values: IncidentFormValues) {
    setError(null)
    try {
      if (incidentId) {
        const updateData: IncidentUpdate = {
          title: values.title,
          description: values.description ?? null,
          status: values.status as IncidentStatus,
          threat_level: values.threat_level,
          assigned_to: values.assigned_to ?? null,
          vulnerability_id: values.vulnerability_id ?? null,
        }
        await updateMutation.mutateAsync({ incidentId, data: updateData })
        await queryClient.invalidateQueries({ queryKey: getListIncidentsV1IncidentsGetQueryKey() })
        await queryClient.invalidateQueries({ queryKey: getGetIncidentV1IncidentsIncidentIdGetQueryKey(incidentId) })
        toast.success('Инцидент сохранён')
        router.push(`/incidents/${incidentId}`)
        return
      } else {
        const createData: IncidentCreate = {
          title: values.title,
          description: values.description ?? null,
          threat_level: values.threat_level,
          location_id: values.location_id,
          category_id: values.category_id,
          vulnerability_id: values.vulnerability_id ?? null,
          occurred_at: values.occurred_at,
        }
        await createMutation.mutateAsync({ data: createData })
        toast.success('Инцидент создан')
      }
      router.push('/incidents')
    } catch {
      setError('Не удалось сохранить инцидент')
      toast.error('Ошибка сохранения инцидента')
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <ErrorAlert message={error ?? undefined} />

        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#fafafa]">Заголовок</FormLabel>
              <FormControl>
                <Input
                  placeholder="Краткое описание инцидента"
                  className="border-[#27272a] bg-[#18181b] text-[#fafafa] placeholder:text-[#71717a]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#fafafa]">Описание</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Подробное описание инцидента"
                  rows={4}
                  className="border-[#27272a] bg-[#18181b] text-[#fafafa] placeholder:text-[#71717a]"
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Status — only for edit */}
          {incidentId && (
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#fafafa]">Статус</FormLabel>
                  <Select value={field.value ?? ''} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="border-[#27272a] bg-[#18181b] text-[#fafafa]">
                        <span className="flex-1 text-left text-sm">
                          {field.value
                            ? STATUS_LABELS[field.value as keyof typeof STATUS_LABELS] ?? field.value
                            : <span className="text-[#71717a]">Выберите статус</span>}
                        </span>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="border-[#27272a] bg-[#18181b]">
                      {(Object.entries(STATUS_LABELS) as [string, string][]).map(([value, label]) => (
                        <SelectItem
                          key={value}
                          value={value}
                          className="text-[#fafafa] focus:bg-[#27272a]"
                        >
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Threat Level */}
          <FormField
            control={form.control}
            name="threat_level"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#fafafa]">Уровень угрозы</FormLabel>
                <Select
                  value={String(field.value)}
                  onValueChange={(v) => field.onChange(Number(v))}
                >
                  <FormControl>
                    <SelectTrigger className="border-[#27272a] bg-[#18181b] text-[#fafafa]">
                      <span className="flex-1 text-left text-sm">
                        {field.value
                          ? `${field.value} — ${THREAT_LABELS[Number(field.value) - 1]}`
                          : <span className="text-[#71717a]">Выберите уровень</span>}
                      </span>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="border-[#27272a] bg-[#18181b]">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <SelectItem
                        key={level}
                        value={String(level)}
                        className="text-[#fafafa] focus:bg-[#27272a]"
                      >
                        {level} — {THREAT_LABELS[level - 1]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Location — only for create */}
          {!incidentId && (
            <FormField
              control={form.control}
              name="location_id"
              render={({ field }) => {
                const selected = locations.find((l: any) => l.id === field.value)
                return (
                  <FormItem>
                    <FormLabel className="text-[#fafafa]">Локация</FormLabel>
                    <Select value={field.value ?? ''} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="border-[#27272a] bg-[#18181b] text-[#fafafa]">
                          <span className={`flex-1 text-left text-sm ${!selected ? 'text-[#71717a]' : ''}`}>
                            {selected ? selected.name : 'Выберите локацию'}
                          </span>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="border-[#27272a] bg-[#18181b]">
                        {locations.map((loc: any) => (
                          <SelectItem
                            key={loc.id}
                            value={loc.id}
                            className="text-[#fafafa] focus:bg-[#27272a]"
                          >
                            {loc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />
          )}

          {/* Category — only for create */}
          {!incidentId && (
            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => {
                const selected = categories.find((c: any) => c.id === field.value)
                return (
                  <FormItem>
                    <FormLabel className="text-[#fafafa]">Категория</FormLabel>
                    <Select value={field.value ?? ''} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="border-[#27272a] bg-[#18181b] text-[#fafafa]">
                          <span className={`flex-1 text-left text-sm ${!selected ? 'text-[#71717a]' : ''}`}>
                            {selected ? selected.name : 'Выберите категорию'}
                          </span>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="border-[#27272a] bg-[#18181b]">
                        {categories.map((cat: any) => (
                          <SelectItem
                            key={cat.id}
                            value={cat.id}
                            className="text-[#fafafa] focus:bg-[#27272a]"
                          >
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />
          )}

          {/* Assigned To */}
          <FormField
            control={form.control}
            name="assigned_to"
            render={({ field }) => {
              const selected = field.value ? users.find((u: any) => u.id === field.value) : null
              const displayName = selected
                ? [selected.first_name, selected.last_name].filter(Boolean).join(' ')
                : null
              return (
                <FormItem>
                  <FormLabel className="text-[#fafafa]">Назначен</FormLabel>
                  <Select
                    value={field.value ?? '__none__'}
                    onValueChange={(v) => field.onChange(v === '__none__' ? null : v)}
                  >
                    <FormControl>
                      <SelectTrigger className="border-[#27272a] bg-[#18181b] text-[#fafafa]">
                        <span className={`flex-1 text-left text-sm ${!displayName ? 'text-[#71717a]' : ''}`}>
                          {displayName ?? 'Не назначен'}
                        </span>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="border-[#27272a] bg-[#18181b]">
                      <SelectItem value="__none__" className="text-[#71717a] focus:bg-[#27272a]">
                        Не назначен
                      </SelectItem>
                      {users.map((user: any) => (
                        <SelectItem
                          key={user.id}
                          value={user.id}
                          className="text-[#fafafa] focus:bg-[#27272a]"
                        >
                          <span className="flex items-center gap-2">
                            <span>{user.first_name} {user.last_name}</span>
                            <span className="text-xs text-[#71717a]">
                              {ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] ?? user.role}
                              {!user.is_active && ' · неактивен'}
                            </span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )
            }}
          />

          {/* Vulnerability */}
          <FormField
            control={form.control}
            name="vulnerability_id"
            render={({ field }) => {
              const selected = field.value ? vulnerabilities.find((v: any) => v.id === field.value) : null
              return (
                <FormItem>
                  <FormLabel className="text-[#fafafa]">Уязвимость</FormLabel>
                  <Select
                    value={field.value ?? '__none__'}
                    onValueChange={(v) => field.onChange(v === '__none__' ? null : v)}
                  >
                    <FormControl>
                      <SelectTrigger className="border-[#27272a] bg-[#18181b] text-[#fafafa]">
                        <span className={`flex-1 text-left text-sm ${!selected ? 'text-[#71717a]' : ''}`}>
                          {selected ? selected.name : 'Не выбрана'}
                        </span>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="border-[#27272a] bg-[#18181b]">
                      <SelectItem value="__none__" className="text-[#71717a] focus:bg-[#27272a]">
                        Не выбрана
                      </SelectItem>
                      {vulnerabilities.map((vuln: any) => (
                        <SelectItem
                          key={vuln.id}
                          value={vuln.id}
                          className="text-[#fafafa] focus:bg-[#27272a]"
                        >
                          {vuln.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )
            }}
          />

          {/* Occurred At — only for create */}
          {!incidentId && (
            <FormField
              control={form.control}
              name="occurred_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#fafafa]">Дата и время инцидента</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      className="border-[#27272a] bg-[#18181b] text-[#fafafa]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            disabled={isPending}
            className="bg-[#7c3aed] text-white hover:bg-[#6d28d9]"
          >
            {isPending ? 'Сохранение…' : incidentId ? 'Сохранить' : 'Создать'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/incidents')}
            className="border-[#27272a] bg-transparent text-[#a1a1aa] hover:bg-[#27272a] hover:text-[#fafafa]"
          >
            Отмена
          </Button>
        </div>
      </form>
    </Form>
  )
}
