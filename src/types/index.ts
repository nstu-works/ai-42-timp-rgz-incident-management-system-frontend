// src/types/index.ts
export interface ApiResponse<T> {
  success: boolean
  msg: string
  data: T
}

export type UserRole = 'guest' | 'guard' | 'operator' | 'analyst' | 'admin'

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  first_name: string
  last_name: string
  surname?: string
}
