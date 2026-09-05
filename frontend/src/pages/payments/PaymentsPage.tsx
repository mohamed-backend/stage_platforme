import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { usePayments } from '@/hooks'
import { Card, Skeleton, EmptyState, StatCard } from '@/components/common'
import { DashboardLayout } from '@/components/layout'
import { formatCurrency, formatDate } from '@/utils'
import { CreditCard, ArrowDownLeft, Clock, Wallet, CheckCircle2 } from 'lucide-react'

const statusConfig: Record<string, { label: string; bg: string; color: string }> = {
  PENDING: { label: 'En attente', bg: 'var(--warning-light)', color: 'var(--warning)' },
  SUCCESS: { label: 'Complété', bg: 'var(--success-light)', color: 'var(--success)' },
  FAILED: { label: 'Échoué', bg: 'var(--error-light)', color: 'var(--error)' },
  REFUNDED: { label: 'Remboursé', bg: 'var(--surface-secondary)', color: 'var(--text-muted)' },
}

export default function PaymentsPage() {
  const location = useLocation()
  const { data, isLoading } = usePayments({ page_size: 50 })
  const [filter] = useState('ALL')

  const payments = data?.results || []
  const filtered = filter === 'ALL' ? payments : payments.filter((p: any) => p.status === filter)

  const totalPaid = payments.reduce((s: number, p: any) => s + (p.amount || 0), 0)

  return (
    <DashboardLayout currentPath={location.pathname}>
      <div className="space-y-8">
        <div>
          <h1 style={{ color: 'var(--text-primary)' }} className="text-2xl sm:text-3xl font-bold tracking-tight">
            Paiements
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard title="Total payé" value={formatCurrency(totalPaid)} icon={<Wallet className="h-5 w-5" />} variant="accent" />
          <StatCard title="Complétés" value={payments.filter((p: any) => p.status === 'SUCCESS').length.toString()} icon={<CheckCircle2 className="h-5 w-5" />} />
          <StatCard title="En attente" value={payments.filter((p: any) => p.status === 'PENDING').length.toString()} icon={<Clock className="h-5 w-5" />} />
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<CreditCard className="h-7 w-7" />}
            title="Aucun paiement"
            description="Aucun paiement enregistré pour le moment."
          />
        ) : (
          <Card padding={false}>
            <div style={{ borderColor: 'var(--border-subtle)' }} className="divide-y">
              {filtered.map((p: any) => {
                const status = statusConfig[p.status] || statusConfig.PENDING
                const isReturn = p.ref?.startsWith('RET')
                return (
                  <div key={p.id} className="flex items-center gap-4 p-5">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                      style={{
                        background: isReturn ? 'var(--success-light)' : 'var(--accent-muted)',
                        color: isReturn ? 'var(--success)' : 'var(--accent)',
                      }}
                    >
                      {isReturn ? <ArrowDownLeft className="h-5 w-5" /> : <CreditCard className="h-5 w-5" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 style={{ color: 'var(--text-primary)' }} className="text-sm font-semibold truncate">
                          {p.project || p.description || 'Paiement'}
                        </h3>
                        <span
                          className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold"
                          style={{ background: status.bg, color: status.color }}
                        >
                          {status.label}
                        </span>
                      </div>
                      <p style={{ color: 'var(--text-muted)' }} className="mt-1 text-xs font-mono">
                        {p.ref || p.reference} • {p.date || formatDate(p.created_at)}
                      </p>
                    </div>

                    <p
                      className="text-base font-bold"
                      style={{ color: isReturn ? 'var(--success)' : 'var(--text-primary)' }}
                    >
                      {isReturn ? '+' : '-'}{formatCurrency(p.amount)}
                    </p>
                  </div>
                )
              })}
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
