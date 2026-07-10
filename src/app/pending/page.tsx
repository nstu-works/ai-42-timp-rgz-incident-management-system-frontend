// src/app/pending/page.tsx
'use client'

import { useRouter } from 'next/navigation'
import axiosInstance from '@/lib/axios'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/ui/button'

export default function PendingPage() {
  const router = useRouter()
  const clear = useAuthStore((s) => s.clear)

  async function handleLogout() {
    try {
      await axiosInstance.post('/v1/auth/logout', {}, { withCredentials: true })
    } catch {
      // игнорируем ошибку — всё равно очищаем стор
    }
    clear()
    router.push('/login')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#09090b]">
      <div className="w-full max-w-md rounded-xl border border-[#27272a] bg-[#18181b] p-8 text-center">
        <span className="text-2xl font-bold text-[#a78bfa]">IMS</span>
        <div className="mt-6">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#27272a]">
            <svg
              className="h-8 w-8 text-[#a78bfa]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-[#fafafa]">
            Аккаунт на проверке
          </h2>
          <p className="mt-2 text-sm text-[#71717a]">
            Ваш аккаунт ожидает подтверждения администратора.
            <br />
            Обратитесь к администратору системы для получения доступа.
          </p>
        </div>
        <Button
          onClick={handleLogout}
          className="mt-8 w-full bg-[#27272a] text-[#fafafa] hover:bg-[#3f3f46]"
        >
          Выйти
        </Button>
      </div>
    </div>
  )
}
