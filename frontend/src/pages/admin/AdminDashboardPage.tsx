import { useMemo } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout'
import { Card, StatCard, StatCardSkeleton, Badge, Skeleton } from '@/components/common'
import { formatCurrency } from '@/utils'
import { useAdminStats, useAdminPendingProjects } from '@/hooks'
import type { Project } from '@/types'
import { Users, FolderOpen, TrendingUp, CreditCard, ArrowLeftRight, DollarSign, Clock, ArrowRight, Shield, Store, Megaphone, AlertTriangle } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const STATUS_COLORS: Record<string, string> = {
  DRAFT: '#94a3b8',
  PENDING: '#f59e0b',
  PUBLISHED: '#22c55e',
  REJECTED: '#ef4444',
  CLOSED: '#6b7280',
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Brouillon',
  PENDING: 'En attente',
  PUBLISHED: 'Publié',
  REJECTED: 'Rejeté',
  CLOSED: 'Fermé',
  CONFIRMED: 'Confirmé',
  CANCELLED: 'Annulé',
  COMPLETED: 'Terminé',
}

export default function AdminDashboardPage() {
  const location = useLocation()
  const { data: stats, isLoading } = useAdminStats()
  const { data: pendingData, isLoading: pendingLoading } = useAdminPendingProjects()

  const pendingProjects: Project[] = Array.isArray(pendingData) ? pendingData : []

  const projectsPieData = useMemo(() => {
    if (!stats?.projects_by_status) return []
    return Object.entries(stats.projects_by_status).map(([key, val]) => ({
      name: STATUS_LABELS[key] || key,
      value: val,
      color: STATUS_COLORS[key] || 'var(--text-muted)',
    }))
  }, [stats])

  const investmentsBarData = useMemo(() => {
    if (!stats?.investments_by_status) return []
    return Object.entries(stats.investments_by_status).map(([key, val]) => ({
      name: STATUS_LABELS[key] || key,
      count: val,
    }))
  }, [stats])

  const usersBarData = useMemo(() => {
    if (!stats?.users_by_role) return []
    return Object.entries(stats.users_by_role).map(([key, val]) => ({
      name: key === 'INVESTOR' ? 'Investisseur' : key === 'PROJECT_OWNER' ? 'Porteur' : key === 'ADMIN' ? 'Admin' : key,
      count: val,
    }))
  }, [stats])

  const hasStats = !!stats && (stats.total_users > 0 || stats.total_projects > 0)

  return (
    <DashboardLayout currentPath={location.pathname}>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">Console d'Administration</h1>
          <span className="text-xs font-bold text-[var(--accent)] bg-[var(--accent-light)] px-3 py-1 rounded-full border border-[var(--accent-muted)]">
            Accès Superviseur
          </span>
        </div>

        {/* Quick Admin Action Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            { label: 'Utilisateurs', to: '/admin/users', icon: Users, color: 'text-blue-500 bg-blue-500/10' },
            { label: 'Projets', to: '/admin/projects', icon: FolderOpen, color: 'text-amber-500 bg-amber-500/10' },
            { label: 'Investissements', to: '/admin/investments', icon: TrendingUp, color: 'text-emerald-500 bg-emerald-500/10' },
            { label: 'Paiements', to: '/admin/payments', icon: CreditCard, color: 'text-purple-500 bg-purple-500/10' },
            { label: 'Transactions', to: '/admin/transactions', icon: ArrowLeftRight, color: 'text-sky-500 bg-sky-500/10' },
            { label: 'Marché', to: '/admin/listings', icon: Store, color: 'text-pink-500 bg-pink-500/10' },
            { label: 'Réclamations', to: '/admin/claims', icon: AlertTriangle, color: 'text-rose-500 bg-rose-500/10' },
            { label: 'Diffusions', to: '/admin/notifications', icon: Megaphone, color: 'text-indigo-500 bg-indigo-500/10' },
          ].map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.to}
                to={item.to}
                className="flex flex-col items-center justify-center p-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] hover:bg-[var(--surface-secondary)] hover:border-[var(--accent-muted)] hover:shadow-md transition-all group text-center"
              >
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${item.color} group-hover:scale-110 transition-transform mb-1.5`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-[11px] font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate w-full">
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <StatCardSkeleton key={i} />)
            : (
              <>
                <StatCard title="Utilisateurs" value={stats?.total_users ?? 0} icon={<Users className="h-5 w-5" />} />
                <StatCard title="Projets" value={stats?.total_projects ?? 0} icon={<FolderOpen className="h-5 w-5" />} />
                <StatCard title="Investissements" value={stats?.total_investments ?? 0} icon={<TrendingUp className="h-5 w-5" />} />
                <StatCard title="Paiements" value={stats?.total_payments ?? 0} icon={<CreditCard className="h-5 w-5" />} />
                <StatCard title="Transactions" value={stats?.total_transactions ?? 0} icon={<ArrowLeftRight className="h-5 w-5" />} />
                <StatCard title="Volume financier" value={formatCurrency(stats?.total_volume ?? 0)} icon={<DollarSign className="h-5 w-5" />} />
              </>
            )
          }
        </div>

        {/* Charts */}
        {hasStats && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Projects by status - Pie */}
            <Card>
              <h2 className="text-base font-bold text-[var(--text-primary)]">Projets par statut</h2>
              <div className="mt-5 h-[250px]">
                {isLoading ? (
                  <Skeleton className="h-full w-full rounded-xl" />
                ) : projectsPieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={projectsPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {projectsPieData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--border-subtle)', borderRadius: '12px', color: 'var(--text-primary)' }} />
                      <Legend iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-[var(--text-muted)]">Aucune donnée</div>
                )}
              </div>
            </Card>

            {/* Investments by status - Bar */}
            <Card>
              <h2 className="text-base font-bold text-[var(--text-primary)]">Investissements par statut</h2>
              <div className="mt-5 h-[250px]">
                {isLoading ? (
                  <Skeleton className="h-full w-full rounded-xl" />
                ) : investmentsBarData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={investmentsBarData} barCategoryGap="25%">
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--border-subtle)', borderRadius: '12px', color: 'var(--text-primary)' }} />
                      <Bar dataKey="count" fill="var(--accent)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-[var(--text-muted)]">Aucune donnée</div>
                )}
              </div>
            </Card>

            {/* Users by role - Bar */}
            <Card>
              <h2 className="text-base font-bold text-[var(--text-primary)]">Utilisateurs par rôle</h2>
              <div className="mt-5 h-[250px]">
                {isLoading ? (
                  <Skeleton className="h-full w-full rounded-xl" />
                ) : usersBarData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={usersBarData} barCategoryGap="25%">
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--border-subtle)', borderRadius: '12px', color: 'var(--text-primary)' }} />
                      <Bar dataKey="count" fill="var(--text-primary)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-[var(--text-muted)]">Aucune donnée</div>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Pending approvals */}
        <Card>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-[var(--warning)]" />
              <h2 className="text-base font-bold text-[var(--text-primary)]">Projets en attente de validation</h2>
            </div>
            <Link to="/admin/projects" className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors">
              Voir tout <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {pendingLoading ? (
            <div className="mt-5 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
            </div>
          ) : pendingProjects.length === 0 ? (
            <div className="mt-5 text-center py-6 text-sm text-[var(--text-muted)]">
              Aucun projet en attente de validation.
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {pendingProjects.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4 transition-colors hover:border-[var(--border-default)]">
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{p.title}</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">{formatCurrency(p.target_amount)} · {p.duration_months} mois</p>
                  </div>
                  <Badge variant="warning">En attente</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
}
