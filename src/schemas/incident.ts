import { z } from 'zod'

export const incidentSchema = z.object({
  title: z.string().min(1, 'Обязательное поле').max(300),
  description: z.string().max(2000).optional(),
  status: z.enum(['open', 'in_progress', 'localized', 'closed']),
  threat_level: z.coerce.number().int().min(1).max(5),
  location_id: z.string().uuid('Выберите локацию'),
  category_id: z.string().uuid('Выберите категорию'),
  assigned_to: z.string().uuid().nullable().optional(),
  vulnerability_id: z.string().uuid().nullable().optional(),
  occurred_at: z.string().min(1, 'Обязательное поле'),
})

export type IncidentFormValues = z.infer<typeof incidentSchema>

export const STATUS_LABELS = {
  open: 'Открыт',
  in_progress: 'В работе',
  localized: 'Локализован',
  closed: 'Закрыт',
} as const
