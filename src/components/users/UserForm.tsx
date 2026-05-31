'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserFormValues,
  type UpdateUserFormValues,
  ROLE_LABELS,
} from '@/schemas/user'
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
  SelectValue,
} from '@/components/ui/select'
import { ErrorAlert } from '@/components/shared/ErrorAlert'
import {
  useCreateUserV1UsersPost,
  useUpdateUserV1UsersUserIdPatch,
} from '@/api/generated/users/users'
import type {
  UserCreate,
  UserUpdate,
  UserRole,
} from '@/api/generated/iMSIncidentManagementSystem.schemas'

interface UserFormProps {
  defaultValues?: Partial<UpdateUserFormValues>
  userId?: string
}

export function UserForm({ defaultValues, userId }: UserFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const createMutation = useCreateUserV1UsersPost()
  const updateMutation = useUpdateUserV1UsersUserIdPatch()

  const isEditing = !!userId
  const schema = isEditing ? updateUserSchema : createUserSchema

  const form = useForm<CreateUserFormValues | UpdateUserFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      surname: '',
      role: 'guard',
      is_active: true,
      ...defaultValues,
    },
  })

  async function onSubmit(values: CreateUserFormValues | UpdateUserFormValues) {
    setError(null)
    try {
      if (isEditing) {
        const v = values as UpdateUserFormValues
        const updateData: UserUpdate = {
          email: v.email || null,
          first_name: v.first_name || null,
          last_name: v.last_name || null,
          surname: v.surname || null,
          role: v.role as UserRole || null,
          is_active: v.is_active ?? null,
        }
        await updateMutation.mutateAsync({ userId, data: updateData })
      } else {
        const v = values as CreateUserFormValues
        const createData: UserCreate = {
          email: v.email,
          password: v.password,
          first_name: v.first_name,
          last_name: v.last_name,
          surname: v.surname || null,
          role: v.role as UserRole,
        }
        await createMutation.mutateAsync({ data: createData })
      }
      router.push('/users')
    } catch {
      setError('Не удалось сохранить пользователя')
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <ErrorAlert message={error ?? undefined} />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* First name */}
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#fafafa]">Имя</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Иван"
                    className="border-[#27272a] bg-[#18181b] text-[#fafafa] placeholder:text-[#71717a]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Last name */}
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#fafafa]">Фамилия</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Иванов"
                    className="border-[#27272a] bg-[#18181b] text-[#fafafa] placeholder:text-[#71717a]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Surname */}
          <FormField
            control={form.control}
            name="surname"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#fafafa]">Отчество</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Иванович"
                    className="border-[#27272a] bg-[#18181b] text-[#fafafa] placeholder:text-[#71717a]"
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Role */}
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#fafafa]">Роль</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value as string}>
                  <FormControl>
                    <SelectTrigger className="border-[#27272a] bg-[#18181b] text-[#fafafa]">
                      <SelectValue placeholder="Выберите роль" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="border-[#27272a] bg-[#18181b]">
                    {(Object.entries(ROLE_LABELS) as [string, string][]).map(([value, label]) => (
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

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#fafafa]">Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="user@example.com"
                    className="border-[#27272a] bg-[#18181b] text-[#fafafa] placeholder:text-[#71717a]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#fafafa]">
                  Пароль{isEditing ? ' (оставьте пустым, чтобы не менять)' : ''}
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder={isEditing ? '••••••••' : 'Минимум 8 символов'}
                    className="border-[#27272a] bg-[#18181b] text-[#fafafa] placeholder:text-[#71717a]"
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            disabled={isPending}
            className="bg-[#7c3aed] text-white hover:bg-[#6d28d9]"
          >
            {isPending ? 'Сохранение…' : isEditing ? 'Сохранить' : 'Создать'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/users')}
            className="border-[#27272a] bg-transparent text-[#a1a1aa] hover:bg-[#27272a] hover:text-[#fafafa]"
          >
            Отмена
          </Button>
        </div>
      </form>
    </Form>
  )
}
