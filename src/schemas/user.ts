import { z } from 'zod'
export const createUserSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(8, 'Минимум 8 символов'),
  first_name: z.string().min(1, 'Обязательное поле').max(100),
  last_name: z.string().min(1, 'Обязательное поле').max(100),
  surname: z.string().max(100).optional(),
  role: z.enum(['guard', 'operator', 'analyst', 'admin']),
  is_active: z.boolean(),
})
export type CreateUserFormValues = z.infer<typeof createUserSchema>

export const updateUserSchema = createUserSchema
  .omit({ password: true })
  .extend({ password: z.string().min(8).optional().or(z.literal('')) })
export type UpdateUserFormValues = z.infer<typeof updateUserSchema>

export const ROLE_LABELS = {
  guard: 'Охранник',
  operator: 'Оператор',
  analyst: 'Аналитик',
  admin: 'Администратор',
} as const
