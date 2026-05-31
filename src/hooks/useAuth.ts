// src/hooks/useAuth.ts
import { useRouter } from 'next/navigation'
import { axiosInstance } from '@/lib/axios'
import { useAuthStore } from '@/store/auth'

export function useAuth() {
  const router = useRouter()
  const clear = useAuthStore((s) => s.clear)

  async function logout() {
    try {
      await axiosInstance.post('/v1/auth/logout')
    } finally {
      clear()
      router.push('/login')
    }
  }

  return { logout }
}
