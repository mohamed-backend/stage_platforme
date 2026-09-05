import { useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { useInvestments } from '@/hooks'
import { Card, CardTitle, Button, Skeleton, EmptyState, StatCard, Badge } from '@/components/common'
import { DashboardLayout } from '@/components/layout'
import { formatCurrency, formatPercent, formatDate } from '@/utils'
import { TrendingUp, TrendingDown, Wallet, BarChart3, ArrowUpRight, ArrowDownRight, Tag, ChevronRight, Briefcase, Plus, ShieldCheck } from 'lucide-react'

const statusConfig: Record<string, { label: string; variant: 'warning' | 'success' | 'default' | 'danger' }> = {
  PENDING: { label: 'En attente', variant: 'warning' },
  CONFIRMED: { label: 'Confirmé', variant: 'success' },
  COMPLETED: { label: 'Terminé', variant: 'default' },
  CANCELLED: { label: 'Annulé', variant: 'danger' },
}

export default function InvestmentsPage() {
  const location = useLocation()
  const [filter, setFilter] = useState('ALL')
  const { data, isLoading } = useInvestments({ page_size: 50 })

  const investments = data?.results || []
  const filtered = filter === 'ALL' ? investments : investments.filter((i: any) => i.status === filter)

  const totalInvested = investments.reduce((s: number, i: any) => s + (i.amount || 0), 0)
  const totalValue = investments.reduce((s: number, i: any) => {
    const ret = (i.project_detail?.expected_return || 9.5) / 100
    return s + (i.amount || 0) * (1 + ret)
  }, 0)
  const gains = totalValue - totalInvested
  const performance = totalInvested > 0 ? (gains / totalInvested) * 100 : 9.5

  return (
    <DashboardLayout currentPath={location.pathname}>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">Mon portefeuille</h1>
          </div>
          <Link to="/projects">
            <Button variant="primary" size="md">
              <Plus className="h-4 w-4 mr-1" />
              Investir dans un projet
            </Button>
          </Link>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total investi"
            value={formatCurrency(totalInvested)}
            icon={<Wallet className="h-5 w-5" />}
            variant="default"
            description="Montant principal alloué"
          />
          <StatCard
            title="Valeur actuelle estimée"
            value={formatCurrency(totalInvested > 0 ? totalValue : 0)}
            icon={<BarChart3 className="h-5 w-5 text-emerald-400" />}
            variant="elevated"
            description="Principal + plus-values latentes"
          />
          <StatCard
            title="Gains projetés"
            value={formatCurrency(totalInvested > 0 ? gains : 0)}
            icon={<TrendingUp className="h-5 w-5 text-[var(--accent)]" />}
            trend={{ value: performance, isPositive: performance >= 0 }}
            variant="accent"
          />
          <StatCard
            title="Lignes d'investissement"
            value={investments.length.toString()}
            icon={<Briefcase className="h-5 w-5" />}
            description="Actifs diversifiés"
          />
        </div>

        {/* Minimalist Filter Tabs */}
        <div className="flex items-center justify-between">
          <div className="flex overflow-x-auto gap-1 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-1 shadow-xs">
            {[
              { id: 'ALL', label: `Tous (${investments.length})` },
              { id: 'CONFIRMED', label: 'Confirmés' },
              { id: 'PENDING', label: 'En attente' },
              { id: 'COMPLETED', label: 'Terminés' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`rounded-xl px-4 py-2 text-xs font-medium transition-all ${
                  filter === f.id
                    ? 'bg-[var(--accent-light)] text-[var(--accent)] font-semibold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Investments List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 w-full rounded-2xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Briefcase className="h-8 w-8" />}
            title="Aucun investissement trouvé"
            description={filter === 'ALL' ? "Vous n'avez pas encore d'investissements actifs." : "Aucune ligne ne correspond à ce filtre."}
            action={
              <Link to="/projects">
                <Button variant="accent" size="md">Explorer les opportunités</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((inv: any) => {
              const status = statusConfig[inv.status] || statusConfig.PENDING
              const canSell = inv.status === 'CONFIRMED'
              const expectedYield = inv.project_detail?.expected_return || 9.5
              const currentVal = inv.amount * (1 + expectedYield / 100)

              return (
                <div
                  key={inv.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] hover:border-[var(--accent-muted)] hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <Link
                      to={`/investments/${inv.id}`}
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent-light)] text-[var(--accent)] group-hover:scale-105 transition-transform"
                    >
                      <TrendingUp className="h-6 w-6" />
                    </Link>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          to={`/investments/${inv.id}`}
                          className="text-base font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate"
                        >
                          {inv.project_detail?.title || inv.project_title || `Projet #${inv.project}`}
                        </Link>
                        <Badge variant={status.variant}>
                          {status.label}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-[var(--text-muted)]">
                        <span>Souscrit le {formatDate(inv.created_at || inv.date)}</span>
                        <span>•</span>
                        <span className="text-[var(--text-secondary)] font-medium">{inv.project_detail?.category || 'Transition Énergétique'}</span>
                        <span>•</span>
                        <span className="text-[var(--success)] font-bold">Rendement +{expectedYield}% / an</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-[var(--border-subtle)]">
                    <div className="text-left sm:text-right">
                      <p className="text-xs text-[var(--text-muted)]">Montant investi</p>
                      <p className="text-base font-extrabold text-[var(--text-primary)] font-mono">{formatCurrency(inv.amount)}</p>
                      <p className="text-[11px] font-semibold text-[var(--success)] mt-0.5">
                        Val. estimée {formatCurrency(currentVal)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {canSell && (
                        <Link to={`/market/new?investment=${inv.id}`}>
                          <Button variant="outline" size="sm" className="hidden sm:inline-flex gap-1.5">
                            <Tag className="h-3.5 w-3.5" />
                            Vendre
                          </Button>
                        </Link>
                      )}
                      <Link
                        to={`/investments/${inv.id}`}
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--bg-secondary)] text-[var(--text-secondary)] group-hover:bg-[var(--accent)] group-hover:text-white transition-colors"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
