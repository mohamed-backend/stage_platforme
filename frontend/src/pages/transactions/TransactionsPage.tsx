import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useTransactions } from '@/hooks'
import { Card, Skeleton, EmptyState } from '@/components/common'
import { DashboardLayout } from '@/components/layout'
import { formatCurrency, formatDate } from '@/utils'
import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight } from 'lucide-react'

const typeConfig: Record<string, { label: string; icon: any; bg: string; color: string }> = {
  INVESTMENT: { label: 'Investissement', icon: ArrowUpRight, bg: 'var(--accent-muted)', color: 'var(--accent)' },
  REFUND: { label: 'Remboursement', icon: ArrowDownLeft, bg: 'var(--success-light)', color: 'var(--success)' },
  DEPOSIT: { label: 'Dépôt', icon: ArrowDownLeft, bg: 'var(--success-light)', color: 'var(--success)' },
  WITHDRAWAL: { label: 'Retrait', icon: ArrowUpRight, bg: 'var(--warning-light)', color: 'var(--warning)' },
}

const statusConfig: Record<string, { label: string; bg: string; color: string }> = {
  PENDING: { label: 'En attente', bg: 'var(--warning-light)', color: 'var(--warning)' },
  COMPLETED: { label: 'Complétée', bg: 'var(--success-light)', color: 'var(--success)' },
  FAILED: { label: 'Échouée', bg: 'var(--error-light)', color: 'var(--error)' },
  CANCELLED: { label: 'Annulée', bg: 'var(--surface-secondary)', color: 'var(--text-muted)' },
}

export default function TransactionsPage() {
  const location = useLocation()
  const [filter, setFilter] = useState('ALL')
  const { data, isLoading } = useTransactions({ page_size: 50 })

  const transactions = data?.results || []
  const filtered = filter === 'ALL' ? transactions : transactions.filter((t: any) => t.type === filter)

  return (
    <DashboardLayout currentPath={location.pathname}>
      <div className="space-y-8">
        <div>
          <h1 style={{ color: 'var(--text-primary)' }} className="text-2xl sm:text-3xl font-bold tracking-tight">
            Transactions
          </h1>
        </div>

        {/* Minimalist Filter tabs */}
        <div
          className="flex flex-wrap gap-1 rounded-2xl p-1 w-fit"
          style={{
            background: 'var(--surface-primary)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          {[
            { id: 'ALL', label: 'Toutes' },
            { id: 'INVESTMENT', label: 'Investissements' },
            { id: 'REFUND', label: 'Remboursements' },
            { id: 'DEPOSIT', label: 'Dépôts' },
            { id: 'WITHDRAWAL', label: 'Retraits' },
          ].map((f) => {
            const active = filter === f.id
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className="rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all"
                style={{
                  background: active ? 'var(--accent-light)' : 'transparent',
                  color: active ? 'var(--accent)' : 'var(--text-secondary)',
                  fontWeight: active ? 600 : 500,
                }}
              >
                {f.label}
              </button>
            )
          })}
        </div>

        {/* Table */}
        {isLoading ? (
          <Card padding={false}>
            <div className="space-y-3 p-6">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          </Card>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<ArrowLeftRight className="h-7 w-7" />}
            title="Aucune transaction"
            description="Aucune transaction trouvée pour ce filtre."
          />
        ) : (
          <Card padding={false}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      background: 'var(--surface-secondary)',
                    }}
                  >
                    <th style={{ color: 'var(--text-muted)' }} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Date</th>
                    <th style={{ color: 'var(--text-muted)' }} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Référence</th>
                    <th style={{ color: 'var(--text-muted)' }} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Entreprise</th>
                    <th style={{ color: 'var(--text-muted)' }} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Type</th>
                    <th style={{ color: 'var(--text-muted)' }} className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wider">Montant</th>
                    <th style={{ color: 'var(--text-muted)' }} className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wider">Statut</th>
                  </tr>
                </thead>
                <tbody style={{ borderColor: 'var(--border-subtle)' }} className="divide-y">
                  {filtered.map((t: any) => {
                    const type = typeConfig[t.type] || typeConfig.INVESTMENT
                    const status = statusConfig[t.status] || statusConfig.PENDING
                    const Icon = type.icon
                    return (
                      <tr
                        key={t.id}
                        className="transition-colors hover:bg-[var(--surface-secondary)]"
                      >
                        <td style={{ color: 'var(--text-secondary)' }} className="px-5 py-3.5 text-sm">
                          {t.date || formatDate(t.created_at)}
                        </td>
                        <td style={{ color: 'var(--text-primary)' }} className="px-5 py-3.5 font-mono text-xs">
                          {t.ref || t.reference}
                        </td>
                        <td style={{ color: 'var(--text-primary)' }} className="px-5 py-3.5 text-sm font-medium">
                          {t.project || t.description || '—'}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                            style={{ background: type.bg, color: type.color }}
                          >
                            <Icon className="h-3 w-3" />
                            {type.label}
                          </span>
                        </td>
                        <td
                          className="px-5 py-3.5 text-right text-sm font-bold"
                          style={{ color: t.amount > 0 ? 'var(--success)' : 'var(--text-primary)' }}
                        >
                          {t.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(t.amount))}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span
                            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                            style={{ background: status.bg, color: status.color }}
                          >
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
