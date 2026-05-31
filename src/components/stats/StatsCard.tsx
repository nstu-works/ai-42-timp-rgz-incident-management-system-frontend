// src/components/stats/StatsCard.tsx
interface StatsCardProps {
  title: string
  value: React.ReactNode
  description?: string
  isLoading?: boolean
}

export function StatsCard({ title, value, description, isLoading }: StatsCardProps) {
  return (
    <div className="rounded-xl border border-[#27272a] bg-[#18181b] p-6">
      <p className="text-sm text-[#71717a]">{title}</p>
      {isLoading ? (
        <div className="mt-2 h-8 w-32 animate-pulse rounded bg-[#27272a]" />
      ) : (
        <p className="mt-2 text-3xl font-semibold text-[#fafafa]">{value}</p>
      )}
      {description && <p className="mt-1 text-xs text-[#52525b]">{description}</p>}
    </div>
  )
}
