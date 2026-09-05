import { useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useInvestments, useProjects, useTransactions } from '@/hooks'
import { useAuthStore } from '@/store'
import { Card, CardHeader, CardTitle, StatCard, EmptyState, Skeleton, ProjectCard, Button } from '@/components/common'
import { DashboardLayout } from '@/components/layout'
import { formatCurrency, formatPercent, formatDate } from '@/utils'
import type { Investment, Transaction } from '@/types'
import {
  Wallet, BarChart3, TrendingUp, TrendingDown, ArrowUpRight, ArrowRight,
  Briefcase, Activity, FolderOpen, Target, Sparkles, Plus,
  ShieldCheck, ArrowDownLeft, Store, Compass, Layers, FileText, AlertTriangle, Shield,
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'

const MONTH_NAMES = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']

function computeMonthlyData(investments: Investment[]) {
  const now = new Date()
  const months: { month: string; investissements: number; gains: number }[] = []

  for (let i = 7; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const label = MONTH_NAMES[d.getMonth()]
    const monthTotal = investments
      .filter((inv) => {
        const created = new Date(inv.created_at)
        return created.getFullYear() === d.getFullYear() && created.getMonth() === d.getMonth()
      })
      .reduce((sum, inv) => sum + (inv.amount || 0), 0)
    months.push({
      month: label,
      investissements: monthTotal,
      gains: Math.round(monthTotal * 0.08),
    })
  }
  return months
}

export default function DashboardPage() {
  const location = useLocation()
  const { user } = useAuthStore()
  const { data: investmentsData, isLoading: investmentsLoading } = useInvestments({ page_size: 50 })
  const { data: projectsData, isLoading: projectsLoading } = useProjects({ page_size: 3, status: 'PUBLISHED' })
  const { data: transactionsData } = useTransactions({ page_size: 6 })

  const investments = useMemo(() => investmentsData?.results || [], [investmentsData])
  const projects = useMemo(() => projectsData?.results || [], [projectsData])
  const transactions = useMemo(() => transactionsData?.results || [], [transactionsData])

  const totalInvested = investments.reduce((s: number, i: Investment) => s + (i.amount || 0), 0)
  // Projected total value including returns
  const totalValue = investments.reduce((s: number, i: Investment) => {
    const ret = (i.project_detail?.expected_return || 9.5) / 100
    return s + (i.amount || 0) * (1 + ret)
  }, 0)
  const currentGains = totalValue - totalInvested
  const performance = totalInvested > 0 ? (currentGains / totalInvested) * 100 : 9.8

  const monthlyData = useMemo(() => computeMonthlyData(investments), [investments])
  const hasChartData = investments.length > 0

  return (
    <DashboardLayout currentPath={location.pathname}>
      <div className="space-y-8 animate-fade-in">
        {/* Welcome Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-gradient-to-br from-[#0c1426] via-[#131d30] to-[#0a101d] p-6 sm:p-8 text-white shadow-xl">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[var(--accent)]/15 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-pink-300 backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5" />
                Tableau de Bord Investisseur
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
                {user?.first_name ? `Bonjour, ${user.first_name}` : 'Bienvenue sur Fundsy'}
              </h1>
              <p className="text-sm text-slate-300">
                Suivez et piloter vos investissements en temps réel.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link to="/projects">
                <Button variant="accent" size="lg" className="shadow-lg shadow-[var(--accent)]/30">
                  <Plus className="h-4 w-4" />
                  Nouvel Investissement
                </Button>
              </Link>
              <Link to="/market">
                <Button variant="secondary" size="lg" className="bg-white/10 border-white/15 text-white hover:bg-white/20">
                  <Store className="h-4 w-4" />
                  Marché
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Feature Action Bar — Feature Discoverability */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { label: 'Opportunités', to: '/projects', icon: Compass, color: 'text-pink-500 bg-pink-500/10' },
            { label: 'Pools', to: '/pools', icon: Layers, color: 'text-sky-500 bg-sky-500/10' },
            { label: 'Marché', to: '/market', icon: Store, color: 'text-purple-500 bg-purple-500/10' },
            { label: 'Portefeuille', to: '/investments', icon: TrendingUp, color: 'text-emerald-500 bg-emerald-500/10' },
            { label: 'Vérification KYC', to: '/kyc', icon: FileText, color: 'text-blue-500 bg-blue-500/10' },
            { label: 'Risques', to: '/risk', icon: Shield, color: 'text-amber-500 bg-amber-500/10' },
            { label: 'Réclamations', to: '/claims', icon: AlertTriangle, color: 'text-rose-500 bg-rose-500/10' },
          ].map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.to}
                to={item.to}
                className="flex flex-col items-center justify-center p-3.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] hover:bg-[var(--surface-secondary)] hover:border-[var(--accent-muted)] hover:shadow-md transition-all group text-center"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.color} group-hover:scale-110 transition-transform mb-2`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate w-full">
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>

        {/* Core Financial Metrics (KPIs) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total investi"
            value={formatCurrency(totalInvested)}
            icon={<Wallet className="h-5 w-5" />}
            variant="default"
            description="Capital engagé"
            loading={investmentsLoading}
          />
          <StatCard
            title="Valeur estimée"
            value={formatCurrency(totalInvested > 0 ? totalValue : 0)}
            icon={<BarChart3 className="h-5 w-5 text-emerald-400" />}
            variant="elevated"
            description="Capital + intérêts projetés"
            loading={investmentsLoading}
          />
          <StatCard
            title="Rendement global"
            value={investments.length > 0 ? formatPercent(performance) : '+9.8%'}
            icon={<TrendingUp className="h-5 w-5 text-pink-500" />}
            trend={{ value: performance, isPositive: performance >= 0 }}
            variant="accent"
            loading={investmentsLoading}
          />
          <StatCard
            title="Projets souscrits"
            value={investments.length.toString()}
            icon={<Target className="h-5 w-5" />}
            description={`${projects.length} opportunités ouvertes`}
            loading={investmentsLoading}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Monthly Inflow */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <CardTitle>Souscriptions mensuelles</CardTitle>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">Historique des 8 derniers mois</p>
              </div>
              <span className="text-xs font-bold text-[var(--accent)] bg-[var(--accent-light)] px-2.5 py-1 rounded-full">
                Flux de capital
              </span>
            </div>
            <div className="h-[280px]">
              {hasChartData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} barCategoryGap="25%">
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '16px',
                        border: '1px solid var(--border-default)',
                        boxShadow: 'var(--shadow-lg)',
                        background: 'var(--surface-elevated)',
                        color: 'var(--text-primary)',
                      }}
                      formatter={(value) => [formatCurrency(Number(value)), 'Investi']}
                    />
                    <Bar dataKey="investissements" fill="var(--accent)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-center p-6 text-sm text-[var(--text-muted)]">
                  <BarChart3 className="h-8 w-8 mb-2 opacity-40" />
                  <p className="font-semibold text-[var(--text-primary)]">Aucun investissement enregistré</p>
                  <p className="text-xs mt-1">Vos graphiques de flux s'activeront dès votre première souscription.</p>
                </div>
              )}
            </div>
          </Card>

          {/* Portfolio Growth Projection */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <CardTitle>Évolution de la valeur</CardTitle>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">Croissance projetée du portefeuille</p>
              </div>
              <span className="text-xs font-bold text-[var(--success)] bg-[var(--success-light)] px-2.5 py-1 rounded-full">
                +12.4% / an
              </span>
            </div>
            <div className="h-[280px]">
              {hasChartData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="colorInvest" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '16px',
                        border: '1px solid var(--border-default)',
                        boxShadow: 'var(--shadow-lg)',
                        background: 'var(--surface-elevated)',
                        color: 'var(--text-primary)',
                      }}
                      formatter={(value) => [formatCurrency(Number(value)), 'Valorisation']}
                    />
                    <Area
                      type="monotone"
                      dataKey="investissements"
                      stroke="var(--accent)"
                      strokeWidth={3}
                      fill="url(#colorInvest)"
                      dot={{ r: 4, fill: 'var(--accent)', strokeWidth: 2, stroke: 'var(--surface-primary)' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-center p-6 text-sm text-[var(--text-muted)]">
                  <TrendingUp className="h-8 w-8 mb-2 opacity-40 text-pink-400" />
                  <p className="font-semibold text-[var(--text-primary)]">Historique en attente</p>
                  <p className="text-xs mt-1">Découvrez les opportunités ouvertes pour faire fructifier votre épargne.</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Portfolio Table & Recent Activity Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Active Portfolio (2 Columns) */}
          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <CardTitle>Mes investissements actifs</CardTitle>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">Détail des positions en cours</p>
                </div>
                <Link to="/investments" className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--accent)] hover:underline">
                  Voir tout ({investments.length}) <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {investmentsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}
                </div>
              ) : investments.length === 0 ? (
                <div className="text-center py-10 rounded-2xl border border-dashed border-[var(--border-default)] p-6">
                  <Briefcase className="h-10 w-10 mx-auto mb-3 text-[var(--text-muted)] opacity-60" />
                  <h4 className="text-sm font-bold text-[var(--text-primary)]">Vous n'avez pas encore d'investissements</h4>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-sm mx-auto">
                    Participez au financement d'entreprises rigoureusement auditées à partir de 50 €.
                  </p>
                  <Link to="/projects" className="inline-block mt-4">
                    <Button variant="accent" size="sm">Découvrir les projets</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {investments.slice(0, 5).map((inv: Investment) => (
                    <Link
                      key={inv.id}
                      to={`/investments/${inv.id}`}
                      className="flex items-center justify-between rounded-2xl border border-[var(--border-subtle)] p-4 hover:border-[var(--accent-muted)] hover:bg-[var(--surface-secondary)] transition-all group"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-light)] text-[var(--accent)] font-bold shrink-0 group-hover:scale-105 transition-transform">
                          <TrendingUp className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                            {inv.project_detail?.title || `Projet #${inv.project}`}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-[var(--text-muted)]">
                            <span>{inv.project_detail?.category || 'Fintech'}</span>
                            <span>•</span>
                            <span className="text-[var(--success)] font-semibold">
                              {inv.project_detail?.expected_return ? `+${inv.project_detail.expected_return}%` : '+9.5%'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-extrabold text-[var(--text-primary)] font-mono">
                          {formatCurrency(inv.amount)}
                        </p>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--success)]">
                          Actif
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Activity Log (1 Column) */}
          <div>
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <CardTitle>Activité récente</CardTitle>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">Dernières opérations</p>
                </div>
                <Link to="/transactions" className="text-xs font-bold text-[var(--accent)] hover:underline">
                  Historique
                </Link>
              </div>

              {transactions.length === 0 ? (
                <div className="text-center py-10 text-xs text-[var(--text-muted)]">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  Aucune transaction récente.
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.slice(0, 5).map((t: Transaction) => {
                    const isPositive = t.type === 'REFUND' || t.type === 'DEPOSIT'
                    return (
                      <div
                        key={t.id}
                        className="flex items-center justify-between rounded-xl border border-[var(--border-subtle)] p-3 bg-[var(--surface-primary)]"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${
                            isPositive ? 'bg-[var(--success-light)] text-[var(--success)]' : 'bg-[var(--accent-light)] text-[var(--accent)]'
                          }`}>
                            {isPositive ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[var(--text-primary)] truncate">
                              {t.description || t.type}
                            </p>
                            <p className="text-[10px] text-[var(--text-muted)]">{formatDate(t.created_at)}</p>
                          </div>
                        </div>

                        <span className={`text-xs font-bold font-mono ${
                          isPositive ? 'text-[var(--success)]' : 'text-[var(--text-primary)]'
                        }`}>
                          {isPositive ? '+' : '-'}{formatCurrency(t.amount)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Recommended Opportunities Carousel / Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                Opportunités à la une
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Projets audités actuellement en phase de levée de fonds
              </p>
            </div>
            <Link to="/projects">
              <Button variant="ghost" size="sm">
                Tous les projets <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>

          {projectsLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-96 w-full rounded-2xl" />)}
            </div>
          ) : projects.length === 0 ? (
            <EmptyState
              title="Aucune opportunité disponible"
              description="De nouvelles campagnes d'investissement seront publiées très prochainement."
              icon={<FolderOpen className="h-8 w-8" />}
            />
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project: any) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
