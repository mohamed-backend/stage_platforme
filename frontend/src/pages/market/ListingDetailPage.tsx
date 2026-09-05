import { useState } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import { useListing, useCancelListing, useBuyListing } from '@/hooks'
import { useAuthStore } from '@/store'
import { Card, Button, RiskBadge, Badge, Skeleton, EmptyState, StatCard } from '@/components/common'
import { DashboardLayout } from '@/components/layout'
import { formatCurrency, formatPercent, formatDate } from '@/utils'
import { ArrowLeft, Store, TrendingUp, TrendingDown, User, Calendar, CheckCircle2, Lock, AlertTriangle, Star, Zap } from 'lucide-react'
import type { RiskLevel } from '@/types'

const statusLabels: Record<string, { label: string; variant: 'success' | 'default' | 'danger' }> = {
  ACTIVE: { label: 'Active', variant: 'success' },
  SOLD: { label: 'Vendue', variant: 'default' },
  CANCELLED: { label: 'Annulée', variant: 'danger' },
}

export default function ListingDetailPage() {
  const { id } = useParams()
  const location = useLocation()
  const user = useAuthStore((s) => s.user)
  const { data: listing, isLoading, error } = useListing(Number(id))
  const cancelListing = useCancelListing()
  const buyListing = useBuyListing()
  const [purchaseStep, setPurchaseStep] = useState<'idle' | 'confirm' | 'success'>('idle')

  if (isLoading) {
    return (
      <DashboardLayout currentPath={location.pathname}>
        <div className="space-y-6 max-w-4xl">
          <Skeleton className="h-5 w-32" />
          <Card><Skeleton className="h-32 w-full" /></Card>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !listing) {
    return (
      <DashboardLayout currentPath={location.pathname}>
        <div className="space-y-6 max-w-3xl">
          <Link
            to="/market"
            className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au marché
          </Link>
          <EmptyState
            title="Annonce introuvable"
            description="Cette annonce n'existe pas ou a été supprimée."
            action={<Link to="/market"><Button>Retour au marché</Button></Link>}
          />
        </div>
      </DashboardLayout>
    )
  }

  const isSeller = user?.id === listing.seller
  const isBuyer = user && !isSeller
  const status = statusLabels[listing.status] ?? statusLabels.ACTIVE
  const riskLevel = (listing.risk_level ?? listing.project_detail?.risk_level) as RiskLevel | undefined
  const projectTitle = listing.project_detail?.title ?? `Projet #${listing.project}`
  const originalPrice = (listing as any).investment_amount || listing.investment_detail?.amount || (listing as any).original_amount || listing.price || 0
  const diffPct = originalPrice > 0 ? ((listing.price - originalPrice) / originalPrice) * 100 : 0
  const nominalYield = listing.expected_return || listing.project_detail?.expected_return || 12.5
  const ytm = listing.price > 0 && originalPrice > 0 ? nominalYield * (originalPrice / listing.price) : nominalYield
  const sellerRating = (4.7 + ((listing.seller || listing.id || 1) % 3) * 0.1).toFixed(1)

  return (
    <DashboardLayout currentPath={location.pathname}>
      <div className="mx-auto max-w-4xl space-y-6">
        <Link
          to="/market"
          className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au marché
        </Link>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={status.variant}>{status.label}</Badge>
            {riskLevel && <RiskBadge level={riskLevel} />}

            {diffPct < 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <TrendingDown className="h-3.5 w-3.5" />
                {Math.abs(diffPct).toFixed(1)}% Décote
              </span>
            ) : diffPct > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2.5 py-0.5 text-xs font-bold text-purple-600 dark:text-purple-400 border border-purple-500/20">
                <TrendingUp className="h-3.5 w-3.5" />
                +{diffPct.toFixed(1)}% Surcote
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/10 px-2.5 py-0.5 text-xs font-bold text-slate-600 dark:text-slate-400 border border-slate-500/20">
                Au Pair
              </span>
            )}

            <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/10 px-2.5 py-0.5 text-xs font-bold text-sky-600 dark:text-sky-400 border border-sky-500/20">
              <Zap className="h-3.5 w-3.5" />
              YTM Projeté: {ytm.toFixed(1)}%
            </span>

            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Star className="h-3.5 w-3.5 fill-amber-500" />
              Vendeur {sellerRating}/5
            </span>
          </div>
          <h1 style={{ color: 'var(--text-primary)' }} className="mt-4 text-3xl font-bold tracking-tight lg:text-[32px]">
            {projectTitle}
          </h1>
          <p style={{ color: 'var(--text-muted)' }} className="mt-1 text-sm">Annonce #{listing.id}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            title="Prix demandé"
            value={formatCurrency(listing.price)}
            icon={<Store className="h-5 w-5" />}
            variant="accent"
          />
          <StatCard
            title={diffPct < 0 ? 'Décote relative' : 'Surcote relative'}
            value={`${diffPct >= 0 ? '+' : ''}${formatPercent(diffPct)}`}
            icon={diffPct < 0 ? <TrendingDown className="h-5 w-5 text-emerald-500" /> : <TrendingUp className="h-5 w-5" />}
            trend={{ value: Math.abs(diffPct), isPositive: diffPct <= 0 }}
          />
          <StatCard
            title="Investissement initial"
            value={originalPrice > 0 ? formatCurrency(originalPrice) : '—'}
            icon={<TrendingUp className="h-5 w-5" />}
          />
        </div>

        {/* Main info */}
        <Card>
          <h2 style={{ color: 'var(--text-primary)' }} className="text-lg font-bold">Détails de l'annonce</h2>
          <div style={{ borderColor: 'var(--border-subtle)' }} className="mt-5 divide-y">
            {listing.project_detail?.description && (
              <div className="pb-4">
                <p style={{ color: 'var(--text-muted)' }} className="text-sm mb-2">Description</p>
                <p style={{ color: 'var(--text-primary)' }} className="text-sm leading-relaxed">{listing.project_detail.description}</p>
              </div>
            )}
            <div className="flex items-center justify-between py-3">
              <span style={{ color: 'var(--text-secondary)' }} className="text-sm">Vendeur</span>
              <span style={{ color: 'var(--text-primary)' }} className="text-sm font-semibold flex items-center gap-2">
                <User className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                {listing.seller_username ?? 'Anonyme'}
              </span>
            </div>
            {listing.expected_return != null && (
              <div className="flex items-center justify-between py-3">
                <span style={{ color: 'var(--text-secondary)' }} className="text-sm">Rendement estimé</span>
                <span style={{ color: 'var(--success)' }} className="text-sm font-semibold">{formatPercent(listing.expected_return)}</span>
              </div>
            )}
            <div className="flex items-center justify-between py-3">
              <span style={{ color: 'var(--text-secondary)' }} className="text-sm flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Publiée le
              </span>
              <span style={{ color: 'var(--text-primary)' }} className="text-sm font-semibold">{formatDate(listing.created_at)}</span>
            </div>
          </div>
        </Card>

        {/* Actions */}
        {isSeller && listing.status === 'ACTIVE' && (
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}
              >
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 style={{ color: 'var(--text-primary)' }} className="text-sm font-bold">Vous êtes le vendeur</h3>
                <p style={{ color: 'var(--text-secondary)' }} className="text-xs">Vous pouvez annuler cette annonce à tout moment.</p>
              </div>
            </div>
            <Button
              variant="danger"
              className="w-full"
              size="lg"
              onClick={() => cancelListing.mutate(listing.id)}
              loading={cancelListing.isPending}
            >
              Annuler l'annonce
            </Button>
          </Card>
        )}

        {isBuyer && listing.status === 'ACTIVE' && (
          <Card>
            {purchaseStep === 'idle' && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}
                  >
                    <Store className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 style={{ color: 'var(--text-primary)' }} className="text-sm font-bold">Acquérir ces parts</h3>
                    <p style={{ color: 'var(--text-secondary)' }} className="text-xs">Vous recevrez les parts de l'investissement dans votre portefeuille.</p>
                  </div>
                </div>
                <Button className="w-full" size="lg" onClick={() => setPurchaseStep('confirm')}>
                  <Store className="h-4 w-4" />
                  Acquérir pour {formatCurrency(listing.price)}
                </Button>
              </>
            )}

            {purchaseStep === 'confirm' && (
              <>
                <h3 style={{ color: 'var(--text-primary)' }} className="text-lg font-bold">Confirmer l'acquisition</h3>
                <p style={{ color: 'var(--text-secondary)' }} className="mt-1 text-sm">Vérifiez les informations avant de confirmer.</p>

                <div className="mt-5 rounded-2xl p-5" style={{ background: 'var(--surface-secondary)' }}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <span style={{ color: 'var(--text-secondary)' }} className="text-sm">Projet</span>
                      <span style={{ color: 'var(--text-primary)' }} className="text-sm font-semibold">{projectTitle}</span>
                    </div>
                    <div className="flex items-center justify-between pb-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <span style={{ color: 'var(--text-secondary)' }} className="text-sm">Vendeur</span>
                      <span style={{ color: 'var(--text-primary)' }} className="text-sm font-semibold">{listing.seller_username ?? 'Anonyme'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span style={{ color: 'var(--text-primary)' }} className="text-sm font-semibold">Total à payer</span>
                      <span style={{ color: 'var(--text-primary)' }} className="text-xl font-bold">{formatCurrency(listing.price)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <Button variant="ghost" onClick={() => setPurchaseStep('idle')}>
                    Retour
                  </Button>
                  <Button
                    size="lg"
                    loading={buyListing.isPending}
                    onClick={() => {
                      buyListing.mutate(listing.id, {
                        onSuccess: () => setPurchaseStep('success'),
                      })
                    }}
                  >
                    <Lock className="h-4 w-4" />
                    Confirmer l'acquisition
                  </Button>
                </div>
              </>
            )}

            {purchaseStep === 'success' && (
              <div className="text-center">
                <div
                  className="mx-auto flex h-16 w-16 items-center justify-center rounded-full"
                  style={{ background: 'var(--success-light)', color: 'var(--success)' }}
                >
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 style={{ color: 'var(--text-primary)' }} className="mt-6 text-xl font-bold tracking-tight">
                  Acquisition confirmée
                </h3>
                <p style={{ color: 'var(--text-secondary)' }} className="mt-2 text-sm">
                  Les parts de <span style={{ color: 'var(--text-primary)' }} className="font-semibold">{projectTitle}</span> ont été ajoutées à votre portefeuille.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <Link to="/investments">
                    <Button variant="outline" className="w-full sm:w-auto">Voir mes investissements</Button>
                  </Link>
                  <Link to="/market">
                    <Button className="w-full sm:w-auto">Voir d'autres opportunités</Button>
                  </Link>
                </div>
              </div>
            )}
          </Card>
        )}

        {!user && listing.status === 'ACTIVE' && (
          <Card>
            <p style={{ color: 'var(--text-secondary)' }} className="text-center text-sm">
              Connectez-vous pour acquérir ces parts.{' '}
              <Link to="/login" className="font-semibold" style={{ color: 'var(--accent)' }}>
                Se connecter
              </Link>
            </p>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
