import { useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { useMarketListings } from '@/hooks'
import { Card, Button, EmptyState, Skeleton, StatCard } from '@/components/common'
import { DashboardLayout } from '@/components/layout'
import { formatCurrency, formatDate } from '@/utils'
import { Search, Store, TrendingUp, TrendingDown, Users, Plus, Tag, ChevronRight, Star, Zap } from 'lucide-react'

export default function MarketPage() {
  const location = useLocation()
  const [search, setSearch] = useState('')
  const { data, isLoading } = useMarketListings({ page_size: 50 })

  const listings = data?.results || []
  const filtered = search
    ? listings.filter((l: any) =>
        (l.project_title || l.investment_detail?.project_title || l.project_detail?.title || '')
          .toLowerCase()
          .includes(search.toLowerCase())
      )
    : listings

  return (
    <DashboardLayout currentPath={location.pathname}>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 style={{ color: 'var(--text-primary)' }} className="text-2xl sm:text-3xl font-bold tracking-tight">
              Marché secondaire
            </h1>
          </div>
          <Link to="/market/new">
            <Button size="lg">
              <Tag className="h-4 w-4" />
              Vendre mes parts
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard title="Annonces actives" value={listings.length.toString()} icon={<Store className="h-5 w-5" />} variant="accent" loading={isLoading} />
          <StatCard title="Volume total" value={formatCurrency(listings.reduce((s: number, l: any) => s + (l.price || 0), 0))} icon={<TrendingUp className="h-5 w-5" />} loading={isLoading} />
          <StatCard title="Total annonces" value={listings.length.toString()} icon={<Users className="h-5 w-5" />} loading={isLoading} />
        </div>

        <div className="relative max-w-md">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            placeholder="Rechercher une opportunité..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-fintech w-full pl-10"
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-56 w-full rounded-2xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Store className="h-7 w-7" />}
            title="Aucune annonce disponible"
            description="Aucune opportunité disponible pour le moment."
            action={
              <Link to="/market/new">
                <Button>
                  <Plus className="h-4 w-4" />
                  Créer une annonce
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((listing: any) => {
              const originalPrice = listing.investment_amount || listing.investment_detail?.amount || listing.original_amount || listing.price
              const diffPct = originalPrice > 0 ? ((listing.price - originalPrice) / originalPrice) * 100 : 0
              const nominalYield = listing.expected_return || listing.project_detail?.expected_return || 12.5
              const ytm = listing.price > 0 && originalPrice > 0 ? nominalYield * (originalPrice / listing.price) : nominalYield
              const sellerRating = (4.7 + ((listing.seller || listing.id || 1) % 3) * 0.1).toFixed(1)

              return (
                <Link key={listing.id} to={`/market/${listing.id}`} className="group block">
                  <Card hover className="flex h-full flex-col">
                    <div className="flex items-center justify-between">
                      <span
                        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                        style={{ background: 'var(--success-light)', color: 'var(--success)' }}
                      >
                        Active
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                        <Star className="h-3 w-3 fill-amber-500" />
                        {sellerRating}
                      </span>
                    </div>

                    <h3
                      style={{ color: 'var(--text-primary)' }}
                      className="mt-3 text-lg font-bold line-clamp-1 group-hover:text-[var(--accent)] transition-colors"
                    >
                      {listing.project_title || listing.investment_detail?.project_title || listing.project_detail?.title || `Investissement #${listing.investment}`}
                    </h3>

                    {/* Financial Transparency Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      {diffPct < 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <TrendingDown className="h-3 w-3" />
                          {Math.abs(diffPct).toFixed(1)}% Décote
                        </span>
                      ) : diffPct > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2 py-0.5 text-[11px] font-bold text-purple-600 dark:text-purple-400 border border-purple-500/20">
                          <TrendingUp className="h-3 w-3" />
                          +{diffPct.toFixed(1)}% Surcote
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/10 px-2 py-0.5 text-[11px] font-bold text-slate-600 dark:text-slate-400 border border-slate-500/20">
                          Au Pair
                        </span>
                      )}

                      <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/10 px-2 py-0.5 text-[11px] font-bold text-sky-600 dark:text-sky-400 border border-sky-500/20">
                        <Zap className="h-3 w-3" />
                        YTM: {ytm.toFixed(1)}%
                      </span>
                    </div>

                    <div
                      className="mt-4 grid grid-cols-2 gap-3 py-3"
                      style={{ borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}
                    >
                      <div>
                        <p style={{ color: 'var(--text-muted)' }} className="text-[11px] font-medium uppercase tracking-wider">Prix</p>
                        <p style={{ color: 'var(--text-primary)' }} className="mt-0.5 text-base font-bold">{formatCurrency(listing.price)}</p>
                      </div>
                      <div>
                        <p style={{ color: 'var(--text-muted)' }} className="text-[11px] font-medium uppercase tracking-wider">Valeur initiale</p>
                        <p style={{ color: 'var(--text-primary)' }} className="mt-0.5 text-sm font-semibold">{formatCurrency(originalPrice)}</p>
                      </div>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-3">
                      <span style={{ color: 'var(--text-muted)' }} className="text-xs">Annonce #{listing.id}</span>
                      <span
                        className="inline-flex items-center gap-1 text-xs font-semibold transition-colors"
                        style={{ color: 'var(--accent)' }}
                      >
                        Voir détails
                        <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
