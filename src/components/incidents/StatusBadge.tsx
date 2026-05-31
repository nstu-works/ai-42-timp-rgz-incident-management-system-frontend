const STATUS_CONFIG = {
  open:        { bg: '#422006', color: '#fb923c', label: 'Открыт' },
  in_progress: { bg: '#2e1065', color: '#c4b5fd', label: 'В работе' },
  localized:   { bg: '#1c1917', color: '#94a3b8', label: 'Локализован' },
  closed:      { bg: '#052e16', color: '#4ade80', label: 'Закрыт' },
} as const

type StatusKey = keyof typeof STATUS_CONFIG

interface StatusBadgeProps {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status as StatusKey] ?? STATUS_CONFIG.open
  return (
    <span
      className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  )
}
