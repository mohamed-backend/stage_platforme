import { useLocation, Link } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout'
import { Card, StatCard, StatCardSkeleton, Skeleton, Badge } from '@/components/common'
import { useInsurerStats, usePendingKYC, useInsurerPendingProjects } from '@/hooks'
import { formatCurrency, formatDate } from '@/utils'
import {
  Shield, FileCheck, FolderOpen, AlertTriangle,
  ArrowRight, BarChart3,
} from 'lucide-react'

export default function InsurerDashboardPage() {
  const location = useLocation()
  const { data: stats, isLoading } = useInsurerStats()
  const { data: pendingKYC, isLoading: kycLoading } = usePendingKYC()
  const { data: pendingProjects, isLoading: projectsLoading } = useInsurerPendingProjects()

  return (
    <DashboardLayout currentPath={location.pathname}>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Tableau de bord Assureur</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">Supervision des règles de garantie, conformité KYC et couverture du risque.</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => <StatCardSkeleton key={i} />)
            : (
              <>
                <StatCard
                  title="KYC en attente"
                  value={stats?.total_kyc_pending ?? 0}
                  icon={<FileCheck className="h-5 w-5" />}
                  variant="dark"
                />
                <StatCard
                  title="Projets en attente"
                  value={stats?.total_projects_pending ?? 0}
                  icon={<FolderOpen className="h-5 w-5" />}
                />
                <StatCard
                  title="Évaluations risque"
                  value={stats?.total_assessments ?? 0}
                  icon={<BarChart3 className="h-5 w-5" />}
                />
              </>
            )
          }
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Pending KYC */}
          <Card>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-[var(--accent)]" />
                <h2 className="text-base font-bold text-[var(--text-primary)]">KYC en attente</h2>
              </div>
              <Link to="/insurer/kyc" className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors">
                Voir tout <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            {kycLoading ? (
              <div className="mt-5 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
              </div>
            ) : !pendingKYC || pendingKYC.length === 0 ? (
              <div className="mt-5 text-center py-6 text-sm text-[var(--text-muted)]">
                Aucun KYC en attente de vérification.
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {pendingKYC.slice(0, 5).map((kyc) => (
                  <div key={kyc.id} className="flex items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4 transition-colors hover:border-[var(--border-default)]">
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{kyc.username || `Utilisateur #${kyc.user}`}</p>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">Soumis le {formatDate(kyc.submitted_at)}</p>
                    </div>
                    <Badge variant={kyc.status === 'PENDING' ? 'warning' : 'default'}>{kyc.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Pending Projects */}
          <Card>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-[var(--accent)]" />
                <h2 className="text-base font-bold text-[var(--text-primary)]">Projets à évaluer</h2>
              </div>
              <Link to="/insurer/projects" className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors">
                Voir tout <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            {projectsLoading ? (
              <div className="mt-5 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
              </div>
            ) : !pendingProjects || pendingProjects.length === 0 ? (
              <div className="mt-5 text-center py-6 text-sm text-[var(--text-muted)]">
                Aucun projet en attente d'évaluation.
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {pendingProjects.slice(0, 5).map((p: any) => (
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

        {/* Quick actions */}
        <Card>
          <h2 className="text-base font-bold text-[var(--text-primary)]">Actions rapides</h2>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link to="/insurer/kyc" className="flex items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4 hover:border-[var(--border-default)] hover:bg-[var(--surface-secondary)] transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-light)]">
                <FileCheck className="h-5 w-5 text-[var(--accent)]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">Vérifier KYC</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">Vérifier les identités</p>
              </div>
            </Link>
            <Link to="/insurer/projects" className="flex items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4 hover:border-[var(--border-default)] hover:bg-[var(--surface-secondary)] transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-light)]">
                <AlertTriangle className="h-5 w-5 text-[var(--accent)]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">Évaluer risques</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">Analyser les projets</p>
              </div>
            </Link>
            <Link to="/insurer/coverage" className="flex items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4 hover:border-[var(--border-default)] hover:bg-[var(--surface-secondary)] transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-light)]">
                <Shield className="h-5 w-5 text-[var(--accent)]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">Couvertures</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">Gérer les règles</p>
              </div>
            </Link>
            <Link to="/insurer/reports" className="flex items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4 hover:border-[var(--border-default)] hover:bg-[var(--surface-secondary)] transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-light)]">
                <BarChart3 className="h-5 w-5 text-[var(--accent)]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">Rapports</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">Consulter les rapports</p>
              </div>
            </Link>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
