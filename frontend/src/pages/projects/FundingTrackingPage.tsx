import { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useMyProjects, useOwnerInvestments } from '@/hooks'
import { useAuthStore } from '@/store'
import {
  Button, Card, CardTitle, EmptyState, ProgressBar, Skeleton, StatCard,
  StatusBadge, RiskBadge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/common'
import { DashboardLayout } from '@/components/layout'
import { formatCurrency, formatDate, formatPercent } from '@/utils'
import type { Investment, Project, ProjectStatus } from '@/types'
import {
  BarChart3, Calendar, ExternalLink, Layers, PiggyBank, Target, TrendingUp, Users, Sparkles,
} from 'lucide-react'

interface ProjectFundingStats {
  project: Project
  hasPool: boolean
  poolId: number | null
  collected: number
  target: number
  remaining: number
  fundingPercentage: number
  poolStatus: string | null
  startDate: string | null
  endDate: string | null
  daysRemaining: number | null
  totalRaised: number
  investorCount: number
  confirmedCount: number
  pendingCount: number
}

function buildProjectStats(
  projects: Project[],
  investments: Investment[]
): ProjectFundingStats[] {
  return projects.map((project) => {
    const pool = project.pool
    const hasPool = pool !== null && pool !== undefined
    const collected = hasPool ? pool.collected_amount || 0 : 0
    const target = project.target_amount || 0
    const remaining = Math.max(target - collected, 0)
    const fundingPercentage = target > 0 ? Math.min((collected / target) * 100, 100) : 0
    const poolStatus = hasPool ? pool.status : null
    const startDate = hasPool ? pool.start_date || null : null
    const endDate = hasPool ? pool.end_date || null : null

    let daysRemaining: number | null = null
    if (endDate) {
      const end = new Date(endDate).getTime()
      const diff = Math.ceil((end - Date.now()) / (1000 * 60 * 60 * 24))
      daysRemaining = diff
    }

    const projectInvestments = investments.filter(
      (inv) => inv.project_detail?.id === project.id
    )

    const confirmedInvestments = projectInvestments.filter(
      (inv) => inv.status === 'CONFIRMED'
    )
    const totalRaised = confirmedInvestments.reduce(
      (sum, inv) => sum + (inv.amount || 0),
      0
    )

    return {
      project,
      hasPool,
      poolId: hasPool ? pool.id : null,
      collected,
      target,
      remaining,
      fundingPercentage,
      poolStatus,
      startDate,
      endDate,
      daysRemaining,
      totalRaised,
      investorCount: new Set(confirmedInvestments.map((inv) => inv.investor)).size,
      confirmedCount: confirmedInvestments.length,
      pendingCount: projectInvestments.filter((inv) => inv.status === 'PENDING').length,
    }
  })
}

const projectStatusLabels: Record<ProjectStatus, string> = {
  DRAFT: 'Brouillon',
  PENDING: 'En attente',
  PUBLISHED: 'Publié',
  REJECTED: 'Rejeté',
  CLOSED: 'Clôturé',
}

const poolStatusLabels: Record<string, string> = {
  OPEN: 'Ouvert',
  FUNDED: 'Financé',
  CLOSED: 'Clôturé',
  CANCELLED: 'Annulé',
}

export default function FundingTrackingPage() {
  const location = useLocation()
  const { user } = useAuthStore()
  const {
    data: projects,
    isLoading: projectsLoading,
    error: projectsError,
    refetch: refetchProjects,
  } = useMyProjects()
  const {
    data: ownerInvestments,
    isLoading: investmentsLoading,
    error: investmentsError,
    refetch: refetchInvestments,
  } = useOwnerInvestments()

  const [selectedProjectId, setSelectedProjectId] = useState<number | 'all'>('all')

  const stats = useMemo(
    () => buildProjectStats(projects?.results || [], ownerInvestments?.results || []),
    [projects, ownerInvestments]
  )

  const totals = useMemo(() => {
    const totalCollected = stats.reduce((sum, s) => sum + s.collected, 0)
    const totalTarget = stats.reduce((sum, s) => sum + s.target, 0)
    const totalConfirmedRaised = stats.reduce((sum, s) => sum + s.totalRaised, 0)
    const totalInvestors = stats.reduce((sum, s) => sum + s.investorCount, 0)
    const activePools = stats.filter((s) => s.poolStatus === 'OPEN').length
    const fundedProjects = stats.filter((s) => s.poolStatus === 'FUNDED').length
    return {
      totalCollected,
      totalTarget,
      totalConfirmedRaised,
      totalInvestors,
      activePools,
      fundedProjects,
      overallPercentage: totalTarget > 0 ? Math.min((totalCollected / totalTarget) * 100, 100) : 0,
    }
  }, [stats])

  const filteredStats = useMemo(() => {
    if (selectedProjectId === 'all') return stats
    return stats.filter((s) => s.project.id === selectedProjectId)
  }, [stats, selectedProjectId])

  const recentInvestments = useMemo(() => {
    const filtered = ownerInvestments?.results || []
    if (selectedProjectId === 'all') return filtered
    return filtered.filter((inv) => inv.project_detail?.id === selectedProjectId)
  }, [ownerInvestments, selectedProjectId])

  const isLoading = projectsLoading || investmentsLoading
  const error = projectsError || investmentsError

  if (isLoading) {
    return (
      <DashboardLayout currentPath={location.pathname}>
        <div className="space-y-6 animate-fade-in">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28 w-full rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-72 w-full rounded-3xl" />
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout currentPath={location.pathname}>
        <EmptyState
          title="Erreur de chargement"
          description="Impossible de charger le suivi de financement."
          action={
            <Button
              variant="accent"
              onClick={() => {
                refetchProjects()
                refetchInvestments()
              }}
            >
              Retry
            </Button>
          }
        />
      </DashboardLayout>
    )
  }

  const hasProjects = stats.length > 0
  const role = user?.role
  if (role && role !== 'PROJECT_OWNER' && role !== 'ADMIN') {
    return (
      <DashboardLayout currentPath={location.pathname}>
        <EmptyState
          title="Espace Réservé aux Porteurs de Projet"
          description="Cette interface est dédiée aux entrepreneurs levant des fonds sur la plateforme."
          action={
            <Link to="/dashboard">
              <Button variant="accent">Retour au tableau de bord</Button>
            </Link>
          }
        />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout currentPath={location.pathname}>
      <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 py-1 text-xs font-bold text-[var(--accent)] mb-2 shadow-xs">
              <Sparkles className="h-3.5 w-3.5" />
              Pilotage des Levées
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
              Suivi de financement
            </h1>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Analysez les flux de capitaux et les souscriptions enregistrées sur vos projets.
            </p>
          </div>
          <Link to="/projects/create">
            <Button variant="accent" size="md">
              <Target className="h-4 w-4" />
              Nouveau projet
            </Button>
          </Link>
        </div>

        {/* Global KPIs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total collecté"
            value={formatCurrency(totals.totalCollected)}
            icon={<PiggyBank className="h-5 w-5 text-emerald-400" />}
            variant="elevated"
            description={`${totals.overallPercentage.toFixed(1)}% de l'objectif global`}
          />
          <StatCard
            title="Objectif global"
            value={formatCurrency(totals.totalTarget)}
            icon={<Target className="h-5 w-5" />}
            variant="default"
            description={`${stats.length} campagne${stats.length > 1 ? 's' : ''}`}
          />
          <StatCard
            title="Investisseurs uniques"
            value={totals.totalInvestors.toString()}
            icon={<Users className="h-5 w-5" />}
            variant="default"
            description={`${totals.activePools} pool${totals.activePools > 1 ? 's' : ''} actif${totals.activePools > 1 ? 's' : ''}`}
          />
          <StatCard
            title="Campagnes financées"
            value={totals.fundedProjects.toString()}
            icon={<TrendingUp className="h-5 w-5 text-[var(--accent)]" />}
            variant="accent"
            description="Objectif 100% atteint"
          />
        </div>

        {!hasProjects ? (
          <EmptyState
            title="Aucun projet à suivre"
            description="Créez votre première campagne pour suivre l'afflux des investisseurs."
            icon={<Layers className="h-8 w-8" />}
            action={
              <Link to="/projects/create">
                <Button variant="accent">
                  <Target className="h-4 w-4" />
                  Créer un projet
                </Button>
              </Link>
            }
          />
        ) : (
          <>
            {/* Filter Bar */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] shadow-xs">
              <label className="text-xs font-bold text-[var(--text-secondary)]">
                Filtrer par campagne :
              </label>
              <select
                value={String(selectedProjectId)}
                onChange={(e) =>
                  setSelectedProjectId(
                    e.target.value === 'all' ? 'all' : Number(e.target.value)
                  )
                }
                className="select-fintech w-auto min-w-[240px]"
                aria-label="Filtrer par projet"
              >
                <option value="all">Toutes les campagnes ({stats.length})</option>
                {stats.map((s) => (
                  <option key={s.project.id} value={s.project.id}>
                    {s.project.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Per-Project Cards */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {filteredStats.map((s) => (
                <Card key={s.project.id} className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/projects/${s.project.id}`}
                        className="text-base font-bold text-[var(--text-primary)] line-clamp-1 hover:text-[var(--accent)] transition-colors"
                      >
                        {s.project.title}
                      </Link>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">
                        {projectStatusLabels[s.project.status] || s.project.status}
                        {s.project.risk_type ? ` · ${s.project.risk_type}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={s.project.status} />
                      <RiskBadge level={s.project.risk_level} />
                    </div>
                  </div>

                  {!s.hasPool ? (
                    <div className="rounded-2xl bg-[var(--warning-light)]/30 border border-[var(--warning-light)] p-4 text-xs space-y-2">
                      <p className="font-semibold text-[var(--text-primary)]">
                        Aucun pool d'investissement actif rattaché.
                      </p>
                      {s.project.status === 'PUBLISHED' && (
                        <Link to="/pools/create" className="inline-block pt-1">
                          <Button size="sm" variant="accent">
                            Ouvrir le pool de souscription
                          </Button>
                        </Link>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="flex items-baseline justify-between pt-2">
                        <div>
                          <p className="text-xs text-[var(--text-muted)]">Collecté</p>
                          <p className="text-2xl font-extrabold text-[var(--text-primary)] font-mono">
                            {formatCurrency(s.collected)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-[var(--text-muted)]">Objectif</p>
                          <p className="text-sm font-bold text-[var(--text-secondary)] font-mono">
                            {formatCurrency(s.target)}
                          </p>
                        </div>
                      </div>

                      <ProgressBar
                        value={s.fundingPercentage}
                        color={s.fundingPercentage >= 100 ? 'success' : 'primary'}
                        size="md"
                      />

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs pt-2">
                        <div className="p-2 rounded-xl bg-[var(--surface-secondary)]">
                          <span className="text-[10px] text-[var(--text-muted)]">Restant</span>
                          <p className="font-bold text-[var(--text-primary)]">{formatCurrency(s.remaining)}</p>
                        </div>
                        <div className="p-2 rounded-xl bg-[var(--surface-secondary)]">
                          <span className="text-[10px] text-[var(--text-muted)]">Investisseurs</span>
                          <p className="font-bold text-[var(--text-primary)]">{s.investorCount}</p>
                        </div>
                        <div className="p-2 rounded-xl bg-[var(--surface-secondary)]">
                          <span className="text-[10px] text-[var(--text-muted)]">Confirmés</span>
                          <p className="font-bold text-[var(--success)]">{s.confirmedCount}</p>
                        </div>
                        <div className="p-2 rounded-xl bg-[var(--surface-secondary)]">
                          <span className="text-[10px] text-[var(--text-muted)]">En attente</span>
                          <p className="font-bold text-[var(--warning)]">{s.pendingCount}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {s.startDate ? formatDate(s.startDate) : '—'} → {s.endDate ? formatDate(s.endDate) : '—'}
                        </span>
                        <Link to={`/projects/${s.project.id}`}>
                          <Button size="sm" variant="ghost">
                            Voir la page publique <ExternalLink className="h-3 w-3 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </>
                  )}
                </Card>
              ))}
            </div>

            {/* Recent Investments Table */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <CardTitle>Dernières souscriptions enregistrées</CardTitle>
                <span className="text-xs font-bold text-[var(--text-muted)]">
                  {recentInvestments.length} transactions
                </span>
              </div>

              {recentInvestments.length === 0 ? (
                <div className="text-center py-10 text-xs text-[var(--text-muted)]">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  Aucune souscription pour le moment.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Investisseur</TableHead>
                      <TableHead>Campagne</TableHead>
                      <TableHead align="right">Montant</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentInvestments.slice(0, 10).map((inv) => (
                      <TableRow key={inv.id}>
                        <TableCell>
                          <span className="font-bold text-[var(--text-primary)]">
                            {inv.investor_username || 'Investisseur'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-[var(--text-secondary)]">
                            {inv.project_detail?.title || inv.project_title || `Projet #${inv.project}`}
                          </span>
                        </TableCell>
                        <TableCell align="right" mono>
                          {formatCurrency(inv.amount)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={inv.status} />
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-[var(--text-muted)]">
                            {formatDate(inv.created_at)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}