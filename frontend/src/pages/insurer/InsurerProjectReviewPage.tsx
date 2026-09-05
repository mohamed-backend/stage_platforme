import { useLocation, Link } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout'
import { Card, EmptyState, Badge, Skeleton, RiskBadge } from '@/components/common'
import { useInsurerPendingProjects, useRiskAssessments } from '@/hooks'
import { formatCurrency } from '@/utils'
import { AlertTriangle, Shield, ArrowRight } from 'lucide-react'
import type { Project } from '@/types'

export default function InsurerProjectReviewPage() {
  const location = useLocation()
  const { data: projectsData, isLoading } = useInsurerPendingProjects()
  const { data: assessmentsData, isLoading: assessLoading } = useRiskAssessments()
  const projects = projectsData || []
  const assessments = assessmentsData?.results || []

  const getAssessmentForProject = (projectId: number) => {
    return assessments.find((a) => a.project === projectId)
  }

  return (
    <DashboardLayout currentPath={location.pathname}>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Évaluation des projets</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Analysez les projets en attente et évaluez les risques de couverture.
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <EmptyState
            title="Aucun projet en attente"
            description="Tous les projets ont été évalués."
            icon={<AlertTriangle className="h-7 w-7 text-[var(--text-muted)]" />}
          />
        ) : (
          <div className="space-y-4">
            {projects.map((project: Project) => {
              const assessment = getAssessmentForProject(project.id)

              return (
                <Card key={project.id} className="overflow-hidden">
                  <div className="p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-[var(--text-primary)]">{project.title}</h3>
                          <Badge variant="warning">En attente</Badge>
                        </div>
                        <p className="mt-2 text-sm text-[var(--text-secondary)] line-clamp-2">{project.description}</p>

                        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                          <div className="rounded-xl bg-[var(--surface-secondary)] border border-[var(--border-subtle)] p-3">
                            <p className="text-xs text-[var(--text-muted)]">Objectif</p>
                            <p className="text-sm font-bold text-[var(--text-primary)] mt-0.5">
                              {formatCurrency(project.target_amount)}
                            </p>
                          </div>
                          <div className="rounded-xl bg-[var(--surface-secondary)] border border-[var(--border-subtle)] p-3">
                            <p className="text-xs text-[var(--text-muted)]">Durée</p>
                            <p className="text-sm font-bold text-[var(--text-primary)] mt-0.5">
                              {project.duration_months} mois
                            </p>
                          </div>
                          <div className="rounded-xl bg-[var(--surface-secondary)] border border-[var(--border-subtle)] p-3">
                            <p className="text-xs text-[var(--text-muted)]">Type de risque</p>
                            <p className="text-sm font-bold text-[var(--text-primary)] mt-0.5">
                              {project.risk_type || '—'}
                            </p>
                          </div>
                          <div className="rounded-xl bg-[var(--surface-secondary)] border border-[var(--border-subtle)] p-3">
                            <p className="text-xs text-[var(--text-muted)]">Niveau de risque</p>
                            <div className="mt-1">
                              <RiskBadge level={project.risk_level} />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-16 sm:ml-0">
                        <Link
                          to={`/projects/${project.id}`}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)] hover:border-[var(--border-default)] hover:bg-[var(--surface-secondary)] transition-all"
                        >
                          <ArrowRight className="h-3.5 w-3.5" />
                          Détails
                        </Link>
                      </div>
                    </div>

                    {/* Assessment info */}
                    {assessment && (
                      <div className="mt-4 rounded-xl bg-[var(--accent-light)] border border-[var(--border-subtle)] p-4">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-[var(--accent)]" />
                          <h4 className="text-sm font-bold text-[var(--text-primary)]">Évaluation de risque</h4>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
                          <div>
                            <p className="text-xs text-[var(--text-muted)]">Score</p>
                            <p className="text-sm font-bold text-[var(--text-primary)]">{assessment.risk_score}/100</p>
                          </div>
                          <div>
                            <p className="text-xs text-[var(--text-muted)]">Probabilité</p>
                            <p className="text-sm font-bold text-[var(--text-primary)]">{assessment.probability}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-[var(--text-muted)]">Impact</p>
                            <p className="text-sm font-bold text-[var(--text-primary)]">{assessment.impact}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-[var(--text-muted)]">Niveau</p>
                            <div className="mt-0.5">
                              <RiskBadge level={assessment.risk_level as any} />
                            </div>
                          </div>
                        </div>
                        {assessment.explanation && (
                          <p className="mt-3 text-sm text-[var(--text-secondary)]">{assessment.explanation}</p>
                        )}
                      </div>
                    )}

                    {!assessment && !assessLoading && (
                      <div className="mt-4 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border-subtle)] p-4 text-center">
                        <p className="text-sm text-[var(--text-muted)]">Aucune évaluation de risque disponible pour ce projet.</p>
                      </div>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
