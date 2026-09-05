import { Link, useLocation } from 'react-router-dom'
import { useMyProjects, useSubmitProject, useCreatePool } from '@/hooks'
import { Button, EmptyState, Skeleton, StatusBadge, ProgressBar, Card } from '@/components/common'
import { DashboardLayout } from '@/components/layout'
import { formatCurrency, formatPercent } from '@/utils'
import { Plus, FolderOpen, Send, ExternalLink, BarChart3, TrendingUp } from 'lucide-react'
import type { Project } from '@/types'

export default function MyProjectsPage() {
  const location = useLocation()
  const { data: projectsData, isLoading, error, refetch } = useMyProjects()
  const projects = projectsData?.results || []
  const submitProject = useSubmitProject()
  const createPool = useCreatePool()

  const handleSubmit = (projectId: number) => {
    submitProject.mutate(projectId)
  }

  const handleAutoCreatePool = (project: Project) => {
    const startDate = new Date().toISOString()
    const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    createPool.mutate({
      project: project.id,
      minimum_investment: 50,
      start_date: startDate,
      end_date: endDate,
    })
  }

  if (isLoading) {
    return (
      <DashboardLayout currentPath={location.pathname}>
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-11 w-40 rounded-xl" />
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-6 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
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
        <EmptyState
          title="Erreur de chargement"
          description="Impossible de charger vos projets pour le moment."
          action={<Button variant="accent" onClick={() => refetch()}>Réessayer</Button>}
        />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout currentPath={location.pathname}>
      <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">Mes projets</h1>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Pilotez vos campagnes de levée de fonds et suivez la collecte en direct.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/projects/mine/funding">
              <Button variant="secondary" size="md">
                <BarChart3 className="h-4 w-4" />
                Suivi de financement
              </Button>
            </Link>
            <Link to="/projects/create">
              <Button variant="accent" size="md">
                <Plus className="h-4 w-4" />
                Nouveau projet
              </Button>
            </Link>
          </div>
        </div>

        {projects.length === 0 ? (
          <EmptyState
            title="Vous n'avez pas encore de projet"
            description="Lancez une campagne pour financer le développement de votre entreprise auprès de milliers d'investisseurs."
            icon={<FolderOpen className="h-8 w-8" />}
            action={
              <Link to="/projects/create">
                <Button variant="accent">
                  <Plus className="h-4 w-4" />
                  Create my first project
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project: Project) => {
              const percent = Math.min(Math.round(((project.collected_amount || 0) / (project.target_amount || 1)) * 100), 100)

              return (
                <div
                  key={project.id}
                  className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-6 shadow-sm hover:border-[var(--accent-muted)] hover:shadow-md transition-all flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-bold text-[var(--text-primary)] line-clamp-1">{project.title}</h3>
                      <StatusBadge status={project.status} />
                    </div>

                    <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>

                    <div className="p-3.5 rounded-2xl bg-[var(--surface-secondary)] space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[var(--text-muted)]">Collecté</span>
                        <span className="font-extrabold text-[var(--text-primary)] font-mono">
                          {formatCurrency(project.collected_amount || 0)}
                        </span>
                      </div>
                      <ProgressBar value={project.collected_amount || 0} max={project.target_amount} size="sm" color="primary" />
                      <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                        <span>Objectif : {formatCurrency(project.target_amount)}</span>
                        <span className="font-bold text-[var(--accent)]">{percent}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)]">
                    <Link to={`/projects/${project.id}`} className="text-xs font-bold text-[var(--accent)] hover:underline inline-flex items-center gap-1">
                      Consulter <ExternalLink className="h-3 w-3" />
                    </Link>

                    {project.status === 'DRAFT' && (
                      <Button
                        size="sm"
                        variant="accent"
                        onClick={() => handleSubmit(project.id)}
                        loading={submitProject.isPending}
                      >
                        <Send className="h-3.5 w-3.5 mr-1" />
                        Soumettre
                      </Button>
                    )}
                    {project.status === 'PUBLISHED' && !project.pool && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleAutoCreatePool(project)}
                        loading={createPool.isPending}
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Auto-Create Pool
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
