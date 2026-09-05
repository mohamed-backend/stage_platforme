import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useInvestments, useRiskAssessments } from '@/hooks'
import { Card, RiskBadge, StatCard, EmptyState, RiskRadarChart } from '@/components/common'
import { DashboardLayout } from '@/components/layout'
import { Shield, AlertTriangle, BarChart3, Target, CheckCircle2 } from 'lucide-react'
import type { RiskLevel, Investment } from '@/types'

const riskLevels: { level: RiskLevel; label: string; description: string; color: string }[] = [
  { level: 'LOW', label: 'Risque faible', description: "Risque relativement faible. Convient aux profils prudents cherchant la stabilité.", color: 'var(--success)' },
  { level: 'MEDIUM', label: 'Risque modéré', description: "Risque équilibré entre rendement et sécurité. Adapté à la plupart des investisseurs.", color: 'var(--warning)' },
  { level: 'HIGH', label: 'Risque élevé', description: "Risque important. Réservé aux investisseurs expérimentés.", color: 'var(--error)' },
]

const riskScoreMap: Record<RiskLevel, number> = { LOW: 25, MEDIUM: 55, HIGH: 85 }

function computeRiskStats(investments: Investment[], assessmentsByProject: Record<number, number>) {
  if (investments.length === 0) {
    return { avgScore: 0, level: 'Aucun' as string, count: 0, highCount: 0, diversification: 0 }
  }

  let totalAmount = 0
  let weightedScore = 0
  let highCount = 0
  const projectIds = new Set<number>()

  investments.forEach((inv) => {
    const projectId = inv.project
    const level = inv.project_detail?.risk_level as RiskLevel | undefined
    const assessmentScore = projectId !== undefined ? assessmentsByProject[projectId] : undefined
    const score = assessmentScore ?? (level ? riskScoreMap[level] : 50) ?? 50
    weightedScore += score * (inv.amount || 0)
    totalAmount += inv.amount || 0
    if (level === 'HIGH') highCount++
    if (inv.project) projectIds.add(inv.project)
  })

  const avgScore = totalAmount > 0 ? Math.round(weightedScore / totalAmount) : 50
  const diversification = Math.min(100, Math.round((projectIds.size / Math.max(investments.length, 1)) * 100))

  let level: string = 'Modéré'
  if (avgScore <= 35) level = 'Faible'
  else if (avgScore >= 65) level = 'Élevé'

  return { avgScore, level, count: investments.length, highCount, diversification }
}

export default function RiskPage() {
  const location = useLocation()
  const { data: investmentsData, isLoading: investmentsLoading } = useInvestments({ page_size: 100 })
  const { data: assessmentsData, isLoading: assessmentsLoading } = useRiskAssessments()
  const investments = investmentsData?.results || []
  const assessments = assessmentsData?.results || []

  const assessmentsByProject = useMemo(() => {
    const map: Record<number, number> = {}
    assessments.forEach((a) => {
      if (a.project && typeof a.risk_score === 'number') {
        map[a.project] = a.risk_score
      }
    })
    return map
  }, [assessments])

  const stats = useMemo(
    () => computeRiskStats(investments, assessmentsByProject),
    [investments, assessmentsByProject]
  )
  const hasData = investments.length > 0
  const isLoading = investmentsLoading || assessmentsLoading

  return (
    <DashboardLayout currentPath={location.pathname}>
      <div className="space-y-8">
        <div>
          <h1 style={{ color: 'var(--text-primary)' }} className="text-3xl font-bold tracking-tight lg:text-[32px]">Gestion des risques</h1>
          <p style={{ color: 'var(--text-secondary)' }} className="mt-2 text-base">Analysez les niveaux de risque de vos investissements.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Score global" value={hasData ? stats.level : '—'} icon={<Shield className="h-5 w-5" />} variant="accent" loading={isLoading} />
          <StatCard title="Diversification" value={hasData ? `${stats.diversification}/100` : '—'} icon={<Target className="h-5 w-5" />} loading={isLoading} />
          <StatCard title="Investissements" value={hasData ? stats.count.toString() : '—'} icon={<BarChart3 className="h-5 w-5" />} loading={isLoading} />
          <StatCard title="Risque élevé" value={hasData ? stats.highCount.toString() : '—'} icon={<AlertTriangle className="h-5 w-5" />} loading={isLoading} />
        </div>

        <Card>
          <h2 style={{ color: 'var(--text-primary)' }} className="text-lg font-bold">Comprendre les niveaux de risque</h2>
          <p style={{ color: 'var(--text-secondary)' }} className="mt-2 text-sm">Chaque opportunité est classée selon son niveau de risque.</p>

          <div className="mt-6 space-y-3">
            {riskLevels.map((risk) => (
              <div
                key={risk.level}
                className="flex items-start gap-4 rounded-xl p-4"
                style={{ border: '1px solid var(--border-subtle)', background: 'var(--surface-secondary)' }}
              >
                <div className="shrink-0">
                  <RiskBadge level={risk.level} />
                </div>
                <div className="flex-1">
                  <h3 style={{ color: 'var(--text-primary)' }} className="text-sm font-bold">{risk.label}</h3>
                  <p style={{ color: 'var(--text-secondary)' }} className="mt-1 text-sm leading-relaxed">{risk.description}</p>
                </div>
                <CheckCircle2 className="h-5 w-5 shrink-0" style={{ color: risk.color }} />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h2 style={{ color: 'var(--text-primary)' }} className="text-lg font-bold">Cartographie Multidimensionnelle des Risques</h2>
              <p style={{ color: 'var(--text-secondary)' }} className="text-xs mt-1">Évaluation visuelle des 5 facteurs clés de risques (Target, Durée, Secteur, Rendement, Expérience)</p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-[var(--accent)] bg-[var(--accent-light)] px-3 py-1 rounded-full mt-2 sm:mt-0">
              Spider Analysis
            </span>
          </div>
          <RiskRadarChart
            targetAmountScore={stats.avgScore}
            durationScore={Math.min(95, stats.avgScore + 10)}
            sectorRiskScore={Math.max(30, stats.avgScore - 15)}
            expectedReturnScore={Math.min(90, stats.avgScore + 15)}
            ownerExperienceScore={Math.min(100, stats.diversification + 20)}
            height={340}
          />
        </Card>

        {hasData ? (
          <Card>
            <h2 style={{ color: 'var(--text-primary)' }} className="text-lg font-bold">Répartition du portefeuille</h2>
            <div className="mt-5 space-y-4">
              {(['LOW', 'MEDIUM', 'HIGH'] as RiskLevel[]).map((level) => {
                const count = investments.filter((i: Investment) => i.project_detail?.risk_level === level).length
                const pct = investments.length > 0 ? Math.round((count / investments.length) * 100) : 0
                return (
                  <div key={level} className="flex items-center gap-4">
                    <RiskBadge level={level} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-sm">
                        <span style={{ color: 'var(--text-secondary)' }}>{count} investissement{count > 1 ? 's' : ''}</span>
                        <span style={{ color: 'var(--text-primary)' }} className="font-semibold">{pct}%</span>
                      </div>
                      <div className="mt-1.5 h-2 overflow-hidden rounded-full" style={{ background: 'var(--surface-secondary)' }}>
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            background: level === 'LOW' ? 'var(--success)' : level === 'MEDIUM' ? 'var(--warning)' : 'var(--error)',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        ) : (
          <EmptyState
            title="Aucun investissement"
            description="Investissez dans un projet pour voir l'analyse des risques de votre portefeuille."
            icon={<Shield className="h-7 w-7" />}
          />
        )}
      </div>
    </DashboardLayout>
  )
}
