import { useParams, useLocation, Link } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout'
import { Card, CardTitle, Button, StatusBadge, Skeleton, EmptyState, StatCard, Badge } from '@/components/common'
import { useInvestment } from '@/hooks'
import { formatCurrency, formatDate, formatPercent } from '@/utils'
import { ArrowLeft, TrendingUp, DollarSign, Calendar, Tag, AlertTriangle, ShieldCheck, FileText, Download, Building2, CheckCircle2 } from 'lucide-react'

export default function InvestmentDetailPage() {
  const { id } = useParams()
  const location = useLocation()
  const { data: investment, isLoading, error } = useInvestment(id!)

  if (isLoading) {
    return (
      <DashboardLayout currentPath={location.pathname}>
        <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-32 w-full rounded-3xl" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
          </div>
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </DashboardLayout>
    )
  }

  if (error || !investment) {
    return (
      <DashboardLayout currentPath={location.pathname}>
        <EmptyState
          title="Investissement introuvable"
          description="Cet investissement n'existe pas ou vous n'avez pas les droits nécessaires pour le consulter."
          action={
            <Link to="/investments">
              <Button variant="accent">Retour au portefeuille</Button>
            </Link>
          }
        />
      </DashboardLayout>
    )
  }

  const canSell = investment.status === 'CONFIRMED'
  const projectTitle = investment.project_detail?.title || `Projet #${investment.project}`
  const expectedReturnRate = investment.project_detail?.expected_return || 9.5
  const estimatedGains = investment.amount * (expectedReturnRate / 100)
  const totalProjected = investment.amount + estimatedGains

  return (
    <DashboardLayout currentPath={location.pathname}>
      <div className="mx-auto max-w-4xl space-y-6 animate-fade-in">
        {/* Breadcrumb */}
        <Link
          to="/investments"
          className="inline-flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au portefeuille
        </Link>

        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider">
                  Contrat d'investissement #{investment.id}
                </span>
                <StatusBadge status={investment.status} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
                {projectTitle}
              </h1>
              <p className="text-xs text-[var(--text-muted)]">
                Souscription enregistrée le {formatDate(investment.created_at)}
              </p>
            </div>

            {canSell && (
              <Link to={`/market/new?investment=${investment.id}`}>
                <Button variant="accent" size="md">
                  <Tag className="h-4 w-4" />
                  Mettre en vente
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            title="Capital investi"
            value={formatCurrency(investment.amount)}
            icon={<DollarSign className="h-5 w-5" />}
            variant="default"
            description="Montant principal"
          />
          <StatCard
            title="Gains estimés"
            value={`+${formatCurrency(estimatedGains)}`}
            icon={<TrendingUp className="h-5 w-5 text-[var(--success)]" />}
            variant="accent"
            trend={{ value: expectedReturnRate, isPositive: true }}
          />
          <StatCard
            title="Valeur à maturité"
            value={formatCurrency(totalProjected)}
            icon={<Building2 className="h-5 w-5 text-emerald-400" />}
            variant="elevated"
            description="Capital + Rendements"
          />
        </div>

        {/* Investment Details & Financial Terms */}
        <Card>
          <CardTitle className="mb-4">Modalités financières & Conditions</CardTitle>
          <div className="divide-y divide-[var(--border-subtle)] text-sm">
            <div className="flex items-center justify-between py-3.5">
              <span className="text-[var(--text-secondary)] font-medium">Catégorie du projet</span>
              <span className="font-bold text-[var(--text-primary)]">
                {investment.project_detail?.category || 'Transition Énergétique'}
              </span>
            </div>
            <div className="flex items-center justify-between py-3.5">
              <span className="text-[var(--text-secondary)] font-medium">Taux de rendement cible annuel</span>
              <span className="font-bold text-[var(--success)]">
                +{expectedReturnRate}% / an
              </span>
            </div>
            <div className="flex items-center justify-between py-3.5">
              <span className="text-[var(--text-secondary)] font-medium">Durée de l'obligation / contrat</span>
              <span className="font-bold text-[var(--text-primary)]">
                {investment.project_detail?.duration_months || 24} mois
              </span>
            </div>
            <div className="flex items-center justify-between py-3.5">
              <span className="text-[var(--text-secondary)] font-medium">Statut de la transaction</span>
              <StatusBadge status={investment.status} />
            </div>
            <div className="flex items-center justify-between py-3.5">
              <span className="text-[var(--text-secondary)] font-medium">Couverture d'assurance</span>
              <span className="inline-flex items-center gap-1.5 font-bold text-emerald-500">
                <ShieldCheck className="h-4 w-4" /> Risque audité & garanti
              </span>
            </div>
          </div>
        </Card>

        {/* Secondary Market Card if Eligible */}
        {canSell ? (
          <div className="rounded-2xl border border-[var(--accent-muted)] bg-[var(--accent-light)]/40 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent)] text-white shrink-0 shadow-sm">
                <Tag className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">Liquidité sur le marché secondaire</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Besoin de récupérer votre capital avant l'échéance ? Vendez vos parts à d'autres investisseurs Fundsy.
                </p>
              </div>
            </div>
            <Link to={`/market/new?investment=${investment.id}`}>
              <Button variant="accent" size="md">
                Publier une offre de vente
              </Button>
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5 flex items-center gap-3 text-xs text-[var(--text-secondary)]">
            <CheckCircle2 className="h-5 w-5 text-[var(--success)] shrink-0" />
            <span>Votre investissement est en cours de validation par nos services financiers. Vos attestations seront disponibles sous 24h.</span>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
