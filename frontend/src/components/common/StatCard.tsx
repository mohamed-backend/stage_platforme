import { cn } from '@/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon?: React.ReactNode
  trend?: { value: number; isPositive: boolean }
  description?: string
  className?: string
  variant?: 'default' | 'dark' | 'accent' | 'elevated'
  loading?: boolean
}

export function StatCard({
  title,
  value,
  icon,
  trend,
  description,
  className,
  variant = 'default',
  loading,
}: StatCardProps) {
  if (loading) {
    return (
      <div className={cn('stat-card', className)}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-24 rounded bg-[var(--bg-tertiary)]" />
          <div className="h-8 w-32 rounded bg-[var(--bg-tertiary)]" />
          <div className="h-3 w-16 rounded bg-[var(--bg-tertiary)]" />
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'stat-card group',
        variant === 'accent' && 'stat-card-accent',
        variant === 'elevated' && 'stat-card-elevated',
        className
      )}
    >
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        {icon && (
          <div className="stat-card-icon group-hover:scale-105 transition-transform duration-200">
            {icon}
          </div>
        )}
      </div>

      <div>
        <div className="stat-card-value font-mono sm:font-sans">{value}</div>

        {(trend || description) && (
          <div className="stat-card-footer">
            {trend && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold',
                  trend.isPositive
                    ? 'bg-[var(--success-light)] text-[var(--success)]'
                    : 'bg-[var(--error-light)] text-[var(--error)]'
                )}
              >
                {trend.isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {trend.isPositive ? '+' : ''}
                {typeof trend.value === 'number' ? `${trend.value.toFixed(1)}%` : trend.value}
              </span>
            )}
            {description && (
              <span className="stat-period-label truncate">{description}</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
