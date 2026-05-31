interface EmptyStateProps {
  message?: string
  action?: React.ReactNode
}

export function EmptyState({
  message = 'Нет данных',
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[#27272a] py-16 text-center">
      <p className="text-[#71717a]">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
