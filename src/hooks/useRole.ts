// src/hooks/useRole.ts
import { useAuthStore } from '@/store/auth'

export function useRole() {
  const role = useAuthStore((s) => s.user?.role)
  return {
    role,
    isGuard: role === 'guard',
    isOperator: role === 'operator',
    isAnalyst: role === 'analyst',
    isAdmin: role === 'admin',
    canCreate: role === 'guard' || role === 'operator' || role === 'admin',
    canEdit: role === 'operator' || role === 'admin',
    canDelete: role === 'admin',
    canViewStats: role === 'analyst' || role === 'admin',
    canViewAudit: role === 'admin',
    canViewUsers: role === 'operator' || role === 'admin',
    canViewVulnerabilities: role === 'operator' || role === 'analyst' || role === 'admin',
  }
}
