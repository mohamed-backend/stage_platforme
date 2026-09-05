import type { RiskLevel } from '@/types'

export const riskColors: Record<RiskLevel, string> = {
  LOW: 'bg-[var(--success-light)] text-[var(--success)] border-[rgba(16,185,129,0.3)]',
  MEDIUM: 'bg-[var(--warning-light)] text-[var(--warning)] border-[rgba(245,158,11,0.3)]',
  HIGH: 'bg-[var(--error-light)] text-[var(--error)] border-[rgba(239,68,68,0.3)]',
}

export const riskDotColors: Record<RiskLevel, string> = {
  LOW: 'bg-[var(--success)]',
  MEDIUM: 'bg-[var(--warning)]',
  HIGH: 'bg-[var(--error)]',
}

export const statusColors: Record<string, string> = {
  PENDING: 'bg-[var(--warning-light)] text-[var(--warning)] border-[rgba(245,158,11,0.3)]',
  CONFIRMED: 'bg-[var(--success-light)] text-[var(--success)] border-[rgba(16,185,129,0.3)]',
  ACTIVE: 'bg-[var(--accent-light)] text-[var(--accent)] border-[var(--accent-muted)]',
  COMPLETED: 'bg-[var(--success-light)] text-[var(--success)] border-[rgba(16,185,129,0.3)]',
  CANCELLED: 'bg-[var(--bg-secondary)] text-[var(--text-muted)] border-[var(--border-subtle)]',
  SUCCESS: 'bg-[var(--success-light)] text-[var(--success)] border-[rgba(16,185,129,0.3)]',
  FAILED: 'bg-[var(--error-light)] text-[var(--error)] border-[rgba(239,68,68,0.3)]',
  SOLD: 'bg-[var(--bg-secondary)] text-[var(--text-muted)] border-[var(--border-subtle)]',
  REFUNDED: 'bg-[var(--warning-light)] text-[var(--warning)] border-[rgba(245,158,11,0.3)]',
  DRAFT: 'bg-[var(--bg-secondary)] text-[var(--text-muted)] border-[var(--border-subtle)]',
  FUNDED: 'bg-[var(--success-light)] text-[var(--success)] border-[rgba(16,185,129,0.3)]',
}
