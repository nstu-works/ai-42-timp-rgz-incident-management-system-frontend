// src/app/(auth)/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { useAuthStore } from '@/store/auth'
import { getMeV1UsersMeGet } from '@/api/generated/users/users'
import { loginSchema, type LoginFormValues } from '@/schemas/auth'
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

export default function LoginPage() {
  const router = useRouter()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(values: LoginFormValues) {
    setError(null)
    try {
      const { data } = await axios.post(
        'http://localhost:8000/api/v1/auth/login',
        values,
        { withCredentials: true }
      )
      const token: string = data.data.access_token
      useAuthStore.getState().setAccessToken(token)
      const meRes = await getMeV1UsersMeGet()
      setAuth(token, (meRes as any).data.data)
      router.push('/incidents')
    } catch {
      setError('Неверный email или пароль')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#09090b]">
      <div className="w-full max-w-sm rounded-xl border border-[#27272a] bg-[#18181b] p-8">
        <div className="mb-6 text-center">
          <span className="text-2xl font-bold text-[#a78bfa]">IMS</span>
          <p className="mt-1 text-sm text-[#71717a]">Вход в систему</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      className="border-[#27272a] bg-[#09090b] text-[#fafafa]"
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
              {form.formState.isSubmitting ? 'Вход...' : 'Войти'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
