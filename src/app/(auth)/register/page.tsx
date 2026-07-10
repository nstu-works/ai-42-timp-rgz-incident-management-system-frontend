// src/app/(auth)/register/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import axiosInstance from '@/lib/axios'
import { useAuthStore } from '@/store/auth'
import { getMeV1UsersMeGet } from '@/api/generated/users/users'
import { registerSchema, type RegisterFormValues } from '@/schemas/auth'
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

export default function RegisterPage() {
  const router = useRouter()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      surname: '',
    },
  })

  async function onSubmit(values: RegisterFormValues) {
    setError(null)
    try {
      const { data } = await axiosInstance.post(
        '/v1/auth/register',
        values,
        { withCredentials: true }
      )
      const token: string = data.data.access_token
      useAuthStore.getState().setAccessToken(token)
      const meRes = await getMeV1UsersMeGet()
      setAuth(token, (meRes as any).data.data)
      router.push('/pending')
    } catch (err: any) {
      const msg = err?.response?.data?.msg
      if (msg === 'Email already registered') {
        setError('Этот email уже зарегистрирован')
      } else {
        setError('Ошибка регистрации. Попробуйте ещё раз.')
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#09090b]">
      <div className="w-full max-w-sm rounded-xl border border-[#27272a] bg-[#18181b] p-8">
        <div className="mb-6 text-center">
          <span className="text-2xl font-bold text-[#a78bfa]">IMS</span>
          <p className="mt-1 text-sm text-[#71717a]">Регистрация</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#fafafa]">Фамилия</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Иванов"
                        className="border-[#27272a] bg-[#09090b] text-[#fafafa] placeholder:text-[#52525b]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#fafafa]">Имя</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Иван"
                        className="border-[#27272a] bg-[#09090b] text-[#fafafa] placeholder:text-[#52525b]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="surname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#fafafa]">
                    Отчество{' '}
                    <span className="text-[#71717a]">(необязательно)</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Иванович"
                      className="border-[#27272a] bg-[#09090b] text-[#fafafa] placeholder:text-[#52525b]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                      className="border-[#27272a] bg-[#09090b] text-[#fafafa] placeholder:text-[#52525b]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#fafafa]">Пароль</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Минимум 6 символов"
                      className="border-[#27272a] bg-[#09090b] text-[#fafafa] placeholder:text-[#52525b]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="w-full bg-[#7c3aed] text-white hover:bg-[#6d28d9]"
            >
              {form.formState.isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
            </Button>
            <p className="text-center text-sm text-[#71717a]">
              Уже есть аккаунт?{' '}
              <Link href="/login" className="text-[#a78bfa] hover:underline">
                Войти
              </Link>
            </p>
          </form>
        </Form>
      </div>
    </div>
  )
}
