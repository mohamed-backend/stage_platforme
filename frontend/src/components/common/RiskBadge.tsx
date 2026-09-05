import { cn } from '@/utils'
import { riskColors, riskDotColors } from '@/utils'
import type { RiskLevel } from '@/types'

interface RiskBadgeProps {
  level: RiskLevel
  className?: string
}

export function RiskBadge({ level, className }: RiskBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border',
        riskColors[level],
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', riskDotColors[level])} />
      {level}
    </span>
  )
}
