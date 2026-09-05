import { useState, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { usePools } from '@/hooks'
import { EmptyState, Skeleton, Select, ErrorMessage, ProgressBar } from '@/components/common'
import { DashboardLayout } from '@/components/layout'
import { formatCurrency } from '@/utils'
import { Search, ArrowRight, Layers } from 'lucide-react'
import type { Pool } from '@/types'

const statusBadges: Record<string, { label: string; bg: string; color: string }> = {
  OPEN:      { label: 'Ouvert',  bg: 'var(--success-light)',  color: 'var(--success)'  },
  FUNDED:    { label: 'Financé', bg: 'var(--accent-muted)',   color: 'var(--accent)'   },
  CLOSED:    { label: 'Clôturé', bg: 'var(--surface-secondary)', color: 'var(--text-muted)' },
  CANCELLED: { label: 'Annulé',  bg: 'var(--error-light)',    color: 'var(--error)'    },
}

export default function PoolsPage() {
  const location = useLocation()
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const apiParams: Record<string, string | number> = {}
  if (status) apiParams.status = status

  const { data: pools, isLoading, error, refetch } = usePools(apiParams)

  let filteredPools: Pool[] = pools?.results || []
  if (debouncedSearch) {
    const q = debouncedSearch.toLowerCase()
    filteredPools = filteredPools.filter(
      (p) => p.project_title?.toLowerCase().includes(q)
    )
  }

  return (
    <DashboardLayout currentPath={location.pathname}>
      <div className="space-y-8">
        <div>
          <h1 style={{ color: 'var(--text-primary)' }} className="text-2xl sm:text-3xl font-bold tracking-tight">
            Pools d'investissement
          </h1>
        </div>

        {/* Toolbar */}
        <div
          className="rounded-2xl p-4 shadow-sm"
          style={{
            background: 'var(--surface-primary)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--text-muted)' }}
              />
              <input
                type="text"
                placeholder="Rechercher un pool..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="input-fintech w-full pl-10"
              />
            </div>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              placeholder="Tous les statuts"
              options={[
                { value: 'OPEN', label: 'Ouvert' },
                { value: 'FUNDED', label: 'Financé' },
                { value: 'CLOSED', label: 'Clôturé' },
              ]}
              className="h-11 lg:w-48"
            />
          </div>
        </div>

        {/* Results count */}
        {!isLoading && !error && (
          <p style={{ color: 'var(--text-muted)' }} className="text-sm">
            {filteredPools.length} pool{filteredPools.length !== 1 ? 's' : ''} trouvé{filteredPools.length !== 1 ? 's' : ''}
          </p>
        )}

        {error ? (
          <ErrorMessage
            message="Impossible de charger les pools."
            onRetry={() => refetch()}
          />
        ) : isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="overflow-hidden rounded-2xl p-5"
                style={{
                  background: 'var(--surface-primary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div className="space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredPools.length === 0 ? (
          <EmptyState
            title="Aucun pool trouvé"
            description="Modifiez vos critères de recherche ou revenez plus tard."
            icon={<Layers className="h-7 w-7" style={{ color: 'var(--text-muted)' }} />}
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPools.map((pool) => {
              const badge = statusBadges[pool.status] || statusBadges.OPEN
              return (
                <Link
                  key={pool.id}
                  to={`/pools/${pool.id}`}
                  className="group block overflow-hidden rounded-2xl shadow-sm transition-all hover:-translate-y-0.5"
                  style={{
                    background: 'var(--surface-primary)',
                    border: '1px solid var(--border-subtle)',
                    boxShadow: 'var(--shadow-card)',
                  }}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2">
                      <h3
                        style={{ color: 'var(--text-primary)' }}
                        className="text-base font-bold line-clamp-1 group-hover:text-[var(--accent)] transition-colors"
                      >
                        {pool.project_title || `Pool #${pool.id}`}
                      </h3>
                      <span
                        className="inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                        style={{ background: badge.bg, color: badge.color }}
                      >
                        {badge.label}
                      </span>
                    </div>

                    <p style={{ color: 'var(--text-secondary)' }} className="mt-2 text-sm">
                      Investissement min. : {formatCurrency(pool.minimum_investment || 0)}
                    </p>

                    {/* Progress bar */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm">
                        <span style={{ color: 'var(--text-secondary)' }}>Collecté</span>
                        <span style={{ color: 'var(--text-primary)' }} className="font-semibold">
                          {pool.funding_percentage || 0}%
                        </span>
                      </div>
                      <ProgressBar
                        value={pool.funding_percentage || 0}
                        size="sm"
                        className="mt-2"
                        color={pool.status === 'FUNDED' ? 'success' : 'primary'}
                      />
                      <div style={{ color: 'var(--text-muted)' }} className="mt-2 flex items-center justify-between text-xs">
                        <span>{formatCurrency(pool.collected_amount || 0)} collectés</span>
                        <span>{formatCurrency(pool.target_amount || 0)} objectif</span>
                      </div>
                    </div>

                    <div
                      className="mt-4 flex items-center gap-1 text-sm font-semibold transition-colors"
                      style={{ color: 'var(--accent)' }}
                    >
                      Voir les détails
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}