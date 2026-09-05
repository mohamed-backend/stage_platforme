import { useParams, useLocation, Link } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout'
import { Card, Badge, EmptyState, Skeleton } from '@/components/common'
import { useTransaction } from '@/hooks'
import { formatCurrency, formatDateTime } from '@/utils'
import { ArrowLeft, ArrowUpRight, ArrowDownLeft } from 'lucide-react'

const typeConfig: Record<string, { label: string; icon: React.ElementType; badgeVariant: 'info' | 'success' | 'warning'; bg: string; color: string }> = {
  INVESTMENT: { label: 'Investissement', icon: ArrowUpRight, badgeVariant: 'info', bg: 'var(--accent-muted)', color: 'var(--accent)' },
  REFUND: { label: 'Rendement', icon: ArrowDownLeft, badgeVariant: 'success', bg: 'var(--success-light)', color: 'var(--success)' },
  DEPOSIT: { label: 'Dépôt', icon: ArrowDownLeft, badgeVariant: 'success', bg: 'var(--success-light)', color: 'var(--success)' },
  WITHDRAWAL: { label: 'Retrait', icon: ArrowUpRight, badgeVariant: 'warning', bg: 'var(--warning-light)', color: 'var(--warning)' },
}

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' }> = {
  PENDING: { label: 'En attente', variant: 'warning' },
  COMPLETED: { label: 'Complétée', variant: 'success' },
  FAILED: { label: 'Échouée', variant: 'danger' },
  CANCELLED: { label: 'Annulée', variant: 'info' },
}

export default function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const { data: transaction, isLoading, error } = useTransaction(Number(id))

  return (
    <DashboardLayout currentPath={location.pathname}>
      <div className="space-y-6 max-w-3xl">
        <Link
          to="/transactions"
          className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux transactions
        </Link>

        {isLoading ? (
          <Card>
            <div className="space-y-6">
              <div>
                <Skeleton className="h-7 w-48 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="p-4 rounded-lg" style={{ background: 'var(--surface-secondary)' }}>
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-8 w-32" />
                </div>
                <div className="p-4 rounded-lg" style={{ background: 'var(--surface-secondary)' }}>
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex justify-between py-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ) : error ? (
          <Card>
            <EmptyState
              title="Erreur"
              description="Impossible de charger les détails de cette transaction."
            />
          </Card>
        ) : !transaction ? (
          <Card>
            <EmptyState
              title="Transaction introuvable"
              description="Cette transaction n'existe pas ou a été supprimée."
            />
          </Card>
        ) : (
          <Card>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 style={{ color: 'var(--text-primary)' }} className="text-2xl font-bold">
                  Transaction {transaction.reference ?? `#${transaction.id}`}
                </h1>
                <p style={{ color: 'var(--text-secondary)' }} className="mt-1 text-sm">
                  {typeConfig[transaction.type]?.label ?? transaction.type}
                </p>
              </div>
              <Badge variant={statusConfig[transaction.status]?.variant ?? 'info'}>
                {statusConfig[transaction.status]?.label ?? transaction.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-xl" style={{ background: 'var(--surface-secondary)' }}>
                <p style={{ color: 'var(--text-muted)' }} className="text-sm mb-1">Montant</p>
                <div className="flex items-center gap-2">
                  {transaction.amount >= 0 ? (
                    <ArrowDownLeft className="h-5 w-5" style={{ color: 'var(--success)' }} />
                  ) : (
                    <ArrowUpRight className="h-5 w-5" style={{ color: 'var(--error)' }} />
                  )}
                  <p
                    className="text-2xl font-bold"
                    style={{ color: transaction.amount >= 0 ? 'var(--success)' : 'var(--error)' }}
                  >
                    {transaction.amount >= 0 ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
                  </p>
                </div>
              </div>
              <div className="p-4 rounded-xl" style={{ background: 'var(--surface-secondary)' }}>
                <p style={{ color: 'var(--text-muted)' }} className="text-sm mb-1">Type</p>
                <div className="flex items-center gap-2">
                  {(() => {
                    const config = typeConfig[transaction.type]
                    if (!config) return <p style={{ color: 'var(--text-primary)' }} className="text-lg font-semibold">{transaction.type}</p>
                    const TypeIcon = config.icon
                    return (
                      <>
                        <div
                          className="inline-flex items-center justify-center h-8 w-8 rounded-full"
                          style={{ background: config.bg, color: config.color }}
                        >
                          <TypeIcon className="h-4 w-4" />
                        </div>
                        <p style={{ color: 'var(--text-primary)' }} className="text-lg font-semibold">{config.label}</p>
                      </>
                    )
                  })()}
                </div>
              </div>
            </div>

            <div className="space-y-0">
              <div className="flex justify-between items-center py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Statut</span>
                <Badge variant={statusConfig[transaction.status]?.variant ?? 'info'}>
                  {statusConfig[transaction.status]?.label ?? transaction.status}
                </Badge>
              </div>
              {transaction.reference && (
                <div className="flex justify-between items-center py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Référence</span>
                  <span className="font-mono font-medium" style={{ color: 'var(--text-primary)' }}>{transaction.reference}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Date</span>
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{formatDateTime(transaction.created_at)}</span>
              </div>
              {transaction.investment_detail && (
                <div className="flex justify-between items-center py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Investissement lié</span>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    {transaction.investment_detail.project_title ?? `Investissement #${transaction.investment}`}
                  </span>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
