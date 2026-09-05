import { useState } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import { usePool } from '@/hooks'
import { useAuthStore } from '@/store'
import { Card, Button, Skeleton, EmptyState, Badge } from '@/components/common'
import { DashboardLayout } from '@/components/layout'
import { formatCurrency, formatDate } from '@/utils'
import {
  ArrowLeft, Calendar, DollarSign, Minus, Plus,
} from 'lucide-react'

export default function PoolDetailPage() {
  const { id } = useParams()
  const location = useLocation()
  const { user } = useAuthStore()
  const { data: pool, isLoading, error } = usePool(id)
  const [amount, setAmount] = useState(pool?.minimum_investment || 100)

  if (isLoading) {
    return (
      <DashboardLayout currentPath={location.pathname}>
        <div className="space-y-6">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="aspect-[21/9] w-full rounded-2xl" />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card><Skeleton className="h-32 w-full" /></Card>
              <Card><Skeleton className="h-48 w-full" /></Card>
            </div>
            <Card><Skeleton className="h-80 w-full" /></Card>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !pool) {
    return (
      <DashboardLayout currentPath={location.pathname}>
        <EmptyState
          title="Pool introuvable"
          description="Ce pool n'existe pas ou n'est plus disponible."
          action={<Link to="/pools"><Button>Retour aux pools</Button></Link>}
        />
      </DashboardLayout>
    )
  }

  const percent = Math.min(pool.funding_percentage || 0, 100)
  const canInvest = user?.role === 'INVESTOR' && pool.status === 'OPEN'
  const targetAmount = pool.target_amount ?? 0
  const collectedAmount = pool.collected_amount ?? 0
  const minInvestment = pool.minimum_investment ?? 0

  return (
    <DashboardLayout currentPath={location.pathname}>
      <div className="space-y-6">
        <Link
          to="/pools"
          className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux pools
        </Link>

        {/* Hero banner */}
        <div
          className="relative overflow-hidden rounded-3xl p-8 lg:p-12 text-white"
          style={{
            background: 'linear-gradient(135deg, #090d16 0%, #1e1b4b 50%, #0f172a 100%)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={pool.status === 'OPEN' ? 'success' : pool.status === 'FUNDED' ? 'warning' : 'default'}>
              {pool.status === 'OPEN' ? 'Ouvert' : pool.status === 'FUNDED' ? 'Financé' : pool.status}
            </Badge>
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {pool.project_title || `Pool #${pool.id}`}
          </h1>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-300">
            <span className="flex items-center gap-1.5">
              <DollarSign className="h-4 w-4" />
              {formatCurrency(targetAmount)} objectif
            </span>
            {pool.end_date && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                Fin le {formatDate(pool.end_date)}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Progress */}
            <Card>
              <h2 style={{ color: 'var(--text-primary)' }} className="text-lg font-bold">Progression du financement</h2>
              <div className="mt-5 flex flex-wrap items-end gap-x-8 gap-y-2">
                <div>
                  <p style={{ color: 'var(--text-muted)' }} className="text-xs font-medium uppercase tracking-wider">Collecté</p>
                  <p style={{ color: 'var(--text-primary)' }} className="mt-1 text-3xl font-bold tracking-tight">
                    {formatCurrency(collectedAmount)}
                  </p>
                </div>
                <div>
                  <p style={{ color: 'var(--text-muted)' }} className="text-xs font-medium uppercase tracking-wider">Objectif</p>
                  <p style={{ color: 'var(--text-secondary)' }} className="mt-1 text-xl font-semibold">
                    {formatCurrency(targetAmount)}
                  </p>
                </div>
                <div>
                  <p style={{ color: 'var(--text-muted)' }} className="text-xs font-medium uppercase tracking-wider">Restant</p>
                  <p style={{ color: 'var(--accent)' }} className="mt-1 text-xl font-semibold">
                    {formatCurrency(Math.max(0, targetAmount - collectedAmount))}
                  </p>
                </div>
                <div>
                  <p style={{ color: 'var(--text-muted)' }} className="text-xs font-medium uppercase tracking-wider">Financé</p>
                  <p style={{ color: 'var(--accent)' }} className="mt-1 text-xl font-semibold">{percent}%</p>
                </div>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full" style={{ background: 'var(--surface-secondary)' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${percent}%`,
                    background: 'linear-gradient(90deg, var(--accent) 0%, var(--accent-hover) 100%)',
                  }}
                />
              </div>
            </Card>

            {/* Details */}
            <Card>
              <h2 style={{ color: 'var(--text-primary)' }} className="text-lg font-bold">Détails du pool</h2>
              <div style={{ borderColor: 'var(--border-subtle)' }} className="mt-5 divide-y">
                {pool.start_date && (
                  <div className="flex items-center justify-between py-3">
                    <span style={{ color: 'var(--text-secondary)' }} className="text-sm">Date de début</span>
                    <span style={{ color: 'var(--text-primary)' }} className="text-sm font-semibold">{formatDate(pool.start_date)}</span>
                  </div>
                )}
                {pool.end_date && (
                  <div className="flex items-center justify-between py-3">
                    <span style={{ color: 'var(--text-secondary)' }} className="text-sm">Date de fin</span>
                    <span style={{ color: 'var(--text-primary)' }} className="text-sm font-semibold">{formatDate(pool.end_date)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between py-3">
                  <span style={{ color: 'var(--text-secondary)' }} className="text-sm">Investissement minimum</span>
                  <span style={{ color: 'var(--text-primary)' }} className="text-sm font-semibold">{formatCurrency(minInvestment)}</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span style={{ color: 'var(--text-secondary)' }} className="text-sm">Statut</span>
                  <Badge variant={pool.status === 'OPEN' ? 'success' : pool.status === 'FUNDED' ? 'warning' : 'default'}>
                    {pool.status}
                  </Badge>
                </div>
              </div>
            </Card>
          </div>

          {/* Investment sidebar */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <Card>
              <h3 style={{ color: 'var(--text-primary)' }} className="text-lg font-bold">Investissez dans ce pool</h3>

              {canInvest ? (
                <>
                  <div className="mt-5">
                    <label style={{ color: 'var(--text-muted)' }} className="text-xs font-semibold uppercase tracking-wider">Montant</label>
                    <div
                      className="mt-2 flex items-center rounded-xl overflow-hidden"
                      style={{ border: '1px solid var(--border-subtle)', background: 'var(--surface-secondary)' }}
                    >
                      <button
                        onClick={() => setAmount(Math.max(minInvestment, amount - 100))}
                        className="flex h-12 w-12 items-center justify-center transition-colors"
                        style={{ color: 'var(--text-muted)' }}
                        aria-label="Diminuer"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <div className="flex-1 text-center">
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(Math.max(minInvestment, Number(e.target.value)))}
                          className="w-full bg-transparent text-center text-lg font-bold focus:outline-none"
                          style={{ color: 'var(--text-primary)' }}
                        />
                      </div>
                      <button
                        onClick={() => setAmount(amount + 100)}
                        className="flex h-12 w-12 items-center justify-center transition-colors"
                        style={{ color: 'var(--text-muted)' }}
                        aria-label="Augmenter"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <p style={{ color: 'var(--text-muted)' }} className="mt-2 text-xs">Minimum : {formatCurrency(minInvestment)}</p>
                  </div>

                  <div className="mt-5 space-y-3 rounded-xl p-4" style={{ background: 'var(--surface-secondary)' }}>
                    <div className="flex items-center justify-between text-sm">
                      <span style={{ color: 'var(--text-secondary)' }}>Montant investi</span>
                      <span style={{ color: 'var(--text-primary)' }} className="font-semibold">{formatCurrency(amount)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span style={{ color: 'var(--text-secondary)' }}>Votre participation</span>
                      <span style={{ color: 'var(--accent)' }} className="font-semibold">
                        {targetAmount > 0 ? ((amount / targetAmount) * 100).toFixed(2) : 0}%
                      </span>
                    </div>
                  </div>

                  <Link to={`/investments/new?pool=${pool.id}&amount=${amount}`} className="block">
                    <Button size="xl" className="mt-5 w-full">
                      Investir maintenant
                    </Button>
                  </Link>
                </>
              ) : user ? (
                <div
                  className="mt-5 rounded-xl p-4 text-center text-sm"
                  style={{ background: 'var(--surface-secondary)', color: 'var(--text-secondary)' }}
                >
                  {pool.status !== 'OPEN' ? "Ce pool n'est plus ouvert aux investissements." : 'Seuls les investisseurs peuvent investir.'}
                </div>
              ) : (
                <Link to="/login" className="block">
                  <Button size="xl" variant="outline" className="mt-5 w-full">
                    Connectez-vous pour investir
                  </Button>
                </Link>
              )}
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
