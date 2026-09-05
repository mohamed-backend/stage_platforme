import { cn } from '@/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'open' | 'funded' | 'draft' | 'cancelled'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'badge',
        `badge-${variant}`,
        className
      )}
    >
      {children}
    </span>
  )
}
