import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout'
import { Card, Button, Skeleton, Badge } from '@/components/common'
import { useInsurerReports, useGenerateReport, useRiskAssessments, useInsurerStats } from '@/hooks'
import { formatDate } from '@/utils'
import {
  BarChart3, FileText,
  Shield, AlertTriangle, TrendingUp,
} from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const REPORT_TYPES = [
  { value: 'KYC_SUMMARY', label: 'Résumé KYC' },
  { value: 'RISK_ANALYSIS', label: 'Analyse des risques' },
  { value: 'COVERAGE_REPORT', label: 'Rapport de couverture' },
  { value: 'PORTFOLIO_SUMMARY', label: 'Résumé du portefeuille' },
]

const RISK_COLORS: Record<string, string> = {
  LOW: '#22c55e',
  MEDIUM: '#f59e0b',
  HIGH: '#ef4444',
}

export default function InsurerReportingPage() {
  const location = useLocation()
  const { data: reportsData, isLoading: reportsLoading } = useInsurerReports()
  const { data: assessmentsData, isLoading: assessLoading } = useRiskAssessments()
  const reports = reportsData || []
  const assessments = assessmentsData?.results || []
  const { data: stats, isLoading: statsLoading } = useInsurerStats()
  const generateReport = useGenerateReport()
  const [selectedType, setSelectedType] = useState('')
  const [reportTitle, setReportTitle] = useState('')

  const riskPieData = assessments.reduce((acc: { name: string; value: number; color: string }[], a) => {
    const existing = acc.find((item) => item.name === a.risk_level)
    if (existing) {
      existing.value++
    } else {
      acc.push({
        name: a.risk_level,
        value: 1,
        color: RISK_COLORS[a.risk_level] || '#6b7280',
      })
    }
    return acc
  }, [])

  const handleGenerate = () => {
    if (!selectedType || !reportTitle.trim()) return
    generateReport.mutate(
      { report_type: selectedType, title: reportTitle },
      { onSuccess: () => { setSelectedType(''); setReportTitle('') } }
    )
  }

  return (
    <DashboardLayout currentPath={location.pathname}>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Rapports & Analyses</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Consultez les métriques consolidées et générez des rapports d'audit de risque.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-light)]">
                <Shield className="h-5 w-5 text-[var(--accent)]" />
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)]">Évaluations</p>
                <p className="text-lg font-bold text-[var(--text-primary)]">{stats?.total_assessments ?? 0}</p>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-light)]">
                <FileText className="h-5 w-5 text-[var(--accent)]" />
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)]">Rapports générés</p>
                <p className="text-lg font-bold text-[var(--text-primary)]">{reports.length ?? 0}</p>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--warning-light)]">
                <AlertTriangle className="h-5 w-5 text-[var(--warning)]" />
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)]">Projets en attente</p>
                <p className="text-lg font-bold text-[var(--text-primary)]">{stats?.total_projects_pending ?? 0}</p>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--success-light)]">
                <TrendingUp className="h-5 w-5 text-[var(--success)]" />
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)]">Couvertures actives</p>
                <p className="text-lg font-bold text-[var(--text-primary)]">{stats?.coverage_count ?? 0}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Risk Distribution Chart */}
          <Card>
            <h2 className="text-base font-bold text-[var(--text-primary)]">Distribution des risques</h2>
            <div className="mt-5 h-[250px]">
              {assessLoading ? (
                <Skeleton className="h-full w-full rounded-xl" />
              ) : riskPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {riskPieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--border-subtle)', borderRadius: '12px', color: 'var(--text-primary)' }} />
                    <Legend iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-[var(--text-muted)]">
                  Aucune donnée disponible
                </div>
              )}
            </div>
          </Card>

          {/* Generate Report */}
          <Card>
            <h2 className="text-base font-bold text-[var(--text-primary)]">Générer un rapport</h2>
            <div className="mt-5 space-y-4">
              <Input
                label="Titre du rapport"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                placeholder="Ex: Rapport mensuel de couverture"
              />

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-[var(--text-primary)]">Type de rapport</label>
                <div className="grid grid-cols-2 gap-2">
                  {REPORT_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setSelectedType(type.value)}
                      className={`rounded-xl border p-3 text-left text-sm font-semibold transition-all ${
                        selectedType === type.value
                          ? 'border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)]'
                          : 'border-[var(--border-subtle)] bg-[var(--surface-primary)] text-[var(--text-secondary)] hover:border-[var(--border-default)] hover:bg-[var(--surface-secondary)]'
                      }`}
                    >
                      <FileText className="h-4 w-4 mb-1" />
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                variant="primary"
                className="w-full"
                loading={generateReport.isPending}
                onClick={handleGenerate}
                disabled={!selectedType || !reportTitle.trim()}
              >
                <BarChart3 className="h-4 w-4 mr-1.5" />
                Générer le rapport
              </Button>
            </div>
          </Card>
        </div>

        {/* Recent Reports */}
        <Card>
          <h2 className="text-base font-bold text-[var(--text-primary)]">Rapports récents</h2>
          {reportsLoading ? (
            <div className="mt-5 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : reports.length === 0 ? (
            <div className="mt-5 text-center py-6 text-sm text-[var(--text-muted)]">
              Aucun rapport généré. Créez votre premier rapport ci-dessus.
            </div>
          ) : (
            <div className="mt-5 divide-y divide-[var(--border-subtle)]">
              {reports.map((report) => (
                <div key={report.id} className="flex items-center justify-between py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent-light)] text-[var(--accent)]">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{report.title}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">
                        {report.report_type} · {formatDate(report.created_at)}
                      </p>
                    </div>
                  </div>
                  <Badge variant="default">{report.report_type}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
}

function Input({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-[var(--text-primary)]">{label}</label>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="input-fintech"
      />
    </div>
  )
}
