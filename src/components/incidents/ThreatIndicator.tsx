interface ThreatIndicatorProps {
  level: number
}

export function ThreatIndicator({ level }: ThreatIndicatorProps) {
  return (
    <div className="flex gap-1" title={`Уровень угрозы: ${level}`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="h-2.5 w-2.5 rounded-sm"
          style={{ background: i < level ? '#ef4444' : '#27272a' }}
        />
      ))}
    </div>
  )
}
