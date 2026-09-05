import { cn } from '@/utils'
import { AlertTriangle, Inbox, RefreshCw } from 'lucide-react'
import { Button } from './Button'

interface ErrorMessageProps {
  message?: string
  className?: string
  onRetry?: () => void
}

export function ErrorMessage({ message = 'Une erreur inattendue est survenue', className, onRetry }: ErrorMessageProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-primary)]', className)}>
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--error-light)] text-[var(--error)]">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <h3 className="mt-4 text-base font-bold text-[var(--text-primary)]">Erreur</h3>
      <p className="mt-1.5 max-w-sm text-sm text-[var(--text-secondary)]">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-5">
          <RefreshCw className="h-4 w-4" />
          Réessayer
        </Button>
      )}
    </div>
  )
}

interface EmptyStateProps {
  title?: string
  description?: string
  icon?: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export function EmptyState({
  title = 'Aucune donnée',
  description = 'Aucune information disponible pour le moment.',
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] shadow-xs', className)}>
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--bg-secondary)] text-[var(--text-muted)]">
        {icon || <Inbox className="h-7 w-7" />}
      </div>
      <h3 className="mt-4 text-base font-bold text-[var(--text-primary)]">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-[var(--text-secondary)]">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton-loader', className)} />
}
