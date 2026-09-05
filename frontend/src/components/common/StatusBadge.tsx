import { cn } from '@/utils'
import { statusColors } from '@/utils'

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variantClass = statusColors[status] || statusColors.PENDING

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variantClass,
        className
      )}
    >
      {status}
    </span>
  )
}
