import { useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout'
import { useMyListings, useCancelListing } from '@/hooks'
import { Card, Button, Badge, EmptyState, Skeleton, StatCard } from '@/components/common'
import { formatCurrency, formatDate } from '@/utils'
import { Tag, Store, Plus, ArrowRight, AlertTriangle } from 'lucide-react'

const statusConfig: Record<string, { label: string; variant: 'success' | 'default' | 'danger' }> = {
  ACTIVE: { label: 'Active', variant: 'success' },
  SOLD: { label: 'Vendue', variant: 'default' },
  CANCELLED: { label: 'Annulée', variant: 'danger' },
}

export default function MyListingsPage() {
  const location = useLocation()
  const { data, isLoading } = useMyListings()
  const cancelListing = useCancelListing()
  const [cancellingId, setCancellingId] = useState<number | null>(null)

  const listings = data?.results ?? []

  const active = listings.filter((l: any) => l.status === 'ACTIVE').length
  const sold = listings.filter((l: any) => l.status === 'SOLD').length
  const totalValue = listings.filter((l: any) => l.status === 'ACTIVE').reduce((s: number, l: any) => s + l.price, 0)

  return (
    <DashboardLayout currentPath={location.pathname}>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 style={{ color: 'var(--text-primary)' }} className="text-3xl font-bold tracking-tight lg:text-[32px]">
              Mes annonces
            </h1>
            <p style={{ color: 'var(--text-secondary)' }} className="mt-2 text-base">
              Gérez vos annonces sur le marché secondaire.
            </p>
          </div>
          <Link to="/market/new">
            <Button size="lg">
              <Plus className="h-4 w-4" />
              Nouvelle annonce
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard title="Annonces actives" value={active.toString()} icon={<Store className="h-5 w-5" />} variant="accent" />
          <StatCard title="Vendues" value={sold.toString()} icon={<Tag className="h-5 w-5" />} />
          <StatCard title="Valeur en vente" value={formatCurrency(totalValue)} icon={<Store className="h-5 w-5" />} />
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
          </div>
        ) : listings.length === 0 ? (
          <EmptyState
            icon={<Tag className="h-7 w-7" />}
            title="Aucune annonce"
            description="Vous n'avez pas encore créé d'annonce sur le marché secondaire."
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
          <Card padding={false}>
            <div style={{ borderColor: 'var(--border-subtle)' }} className="divide-y">
              {listings.map((listing: any) => {
                const status = statusConfig[listing.status] ?? statusConfig.ACTIVE
                const projectTitle = listing.project_detail?.title ?? `Projet #${listing.project}`
                const isCancelling = cancellingId === listing.id
                return (
                  <div key={listing.id} className="p-5">
                    <div className="flex items-center gap-4">
                      <Link
                        to={`/market/${listing.id}`}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                        style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}
                      >
                        <Tag className="h-5 w-5" />
                      </Link>
                      <Link to={`/market/${listing.id}`} className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 style={{ color: 'var(--text-primary)' }} className="text-sm font-semibold truncate">{projectTitle}</h3>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </div>
                        <p style={{ color: 'var(--text-muted)' }} className="mt-1 text-xs">Annonce #{listing.id} • {formatDate(listing.created_at)}</p>
                      </Link>
                      <div className="hidden text-right sm:block">
                        <p style={{ color: 'var(--text-primary)' }} className="text-sm font-bold">{formatCurrency(listing.price)}</p>
                        {listing.investment_detail?.amount && (
                          <p style={{ color: 'var(--text-muted)' }} className="text-xs">
                            Init: {formatCurrency(listing.investment_detail.amount)}
                          </p>
                        )}
                      </div>
                    </div>
                    {listing.status === 'ACTIVE' && (
                      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                        <Link to={`/market/${listing.id}`}>
                          <Button variant="outline" size="sm">
                            Voir l'annonce
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Button
                          variant="danger"
                          size="sm"
                          loading={isCancelling && cancelListing.isPending}
                          onClick={() => {
                            setCancellingId(listing.id)
                            cancelListing.mutate(listing.id, {
                              onSettled: () => setCancellingId(null),
                            })
                          }}
                        >
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Annuler
                        </Button>
                      </div>
                    )}
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
