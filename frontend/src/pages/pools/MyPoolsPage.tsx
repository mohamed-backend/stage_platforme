import { Link, useLocation } from 'react-router-dom'
import { useMyPools } from '@/hooks'
import { Button, EmptyState, Skeleton, StatusBadge, ErrorMessage } from '@/components/common'
import { DashboardLayout } from '@/components/layout'
import { formatCurrency, formatDate } from '@/utils'
import { Plus, Layers, ArrowRight, Calendar } from 'lucide-react'

const statusLabels: Record<string, string> = {
  OPEN: 'Ouvert',
  FUNDED: 'Financé',
  CLOSED: 'Clôturé',
  CANCELLED: 'Annulé',
}

export default function MyPoolsPage() {
  const location = useLocation()
  const { data: poolsData, isLoading, error, refetch } = useMyPools()
  const pools = poolsData?.results || []

  if (isLoading) {
    return (
      <DashboardLayout currentPath={location.pathname}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-11 w-40" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl p-5"
                style={{
                  background: 'var(--surface-primary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <Skeleton className="h-5 w-3/4 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout currentPath={location.pathname}>
        <ErrorMessage
          message="Impossible de charger vos pools."
          onRetry={() => refetch()}
        />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout currentPath={location.pathname}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 style={{ color: 'var(--text-primary)' }} className="text-3xl font-bold tracking-tight">
              Mes pools
            </h1>
            <p style={{ color: 'var(--text-secondary)' }} className="mt-2 text-base">
              Gérez les pools d'investissement associés à vos projets publiés.
            </p>
          </div>
        </div>

        {pools.length === 0 ? (
          <EmptyState
            title="Aucun pool"
            description="Créez un pool pour chaque projet publié afin de collecter les investissements."
            icon={<Layers className="h-7 w-7" style={{ color: 'var(--text-muted)' }} />}
            action={
              <Link to="/projects/mine">
                <Button>
                  <Plus className="h-4 w-4" />
                  Go to my projects
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pools.map((pool: any) => (
              <Link
                key={pool.id}
                to={`/pools/${pool.id}`}
                className="group block rounded-2xl p-5 shadow-sm transition-all hover:shadow-md"
                style={{
                  background: 'var(--surface-primary)',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3
                    style={{ color: 'var(--text-primary)' }}
                    className="text-base font-bold line-clamp-1 group-hover:text-[var(--accent)] transition-colors"
                  >
                    {pool.project_title || `Pool #${pool.id}`}
                  </h3>
                  <StatusBadge status={pool.status} />
                </div>

                <p style={{ color: 'var(--text-muted)' }} className="mt-2 text-xs">
                  {statusLabels[pool.status] || pool.status}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-lg p-3" style={{ background: 'var(--surface-secondary)' }}>
                    <p style={{ color: 'var(--text-muted)' }} className="text-xs">Collecté</p>
                    <p style={{ color: 'var(--text-primary)' }} className="text-sm font-semibold">
                      {formatCurrency(pool.collected_amount || 0)}
                    </p>
                  </div>
                  <div className="rounded-lg p-3" style={{ background: 'var(--surface-secondary)' }}>
                    <p style={{ color: 'var(--text-muted)' }} className="text-xs">Objectif</p>
                    <p style={{ color: 'var(--text-primary)' }} className="text-sm font-semibold">
                      {formatCurrency(pool.target_amount || 0)}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs">
                    <span style={{ color: 'var(--accent)' }} className="font-semibold">
                      {pool.funding_percentage || 0}%
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>financé</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full" style={{ background: 'var(--surface-secondary)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(pool.funding_percentage || 0, 100)}%`,
                        background: 'linear-gradient(90deg, var(--accent) 0%, var(--accent-hover) 100%)',
                      }}
                    />
                  </div>
                </div>

                {pool.end_date && (
                  <p style={{ color: 'var(--text-muted)' }} className="mt-4 flex items-center gap-1.5 text-xs">
                    <Calendar className="h-3.5 w-3.5" />
                    Fin le {formatDate(pool.end_date)}
                  </p>
                )}

                <div
                  className="mt-4 flex items-center gap-1 text-sm font-semibold transition-colors"
                  style={{ color: 'var(--accent)' }}
                >
                  Voir les détails
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}