import { z } from 'zod'

export const locationSchema = z.object({
  name: z.string().min(1, 'Обязательное поле').max(200),
  location_type_id: z.string().uuid('Выберите тип'),
  address: z.string().max(500).optional(),
})
export type LocationFormValues = z.infer<typeof locationSchema>

export const locationTypeSchema = z.object({
  name: z.string().min(1, 'Обязательное поле').max(100),
})
export type LocationTypeFormValues = z.infer<typeof locationTypeSchema>
