import { useState } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import { useProject, useRiskAssessment } from '@/hooks'
import { useAuthStore } from '@/store'
import { Card, CardTitle, Button, Skeleton, EmptyState, RiskBadge, Badge, ProgressBar, StatCard } from '@/components/common'
import { DashboardLayout } from '@/components/layout'
import { formatCurrency, formatPercent, formatDate } from '@/utils'
import {
  ArrowLeft, MapPin, Calendar, Users, TrendingUp, Minus, Plus,
  Building2, Target, Shield, AlertTriangle, BarChart3, CheckCircle2,
  FileText, HelpCircle, Lock, ShieldCheck, ArrowRight,
} from 'lucide-react'

export default function ProjectDetailPage() {
  const { id } = useParams()
  const location = useLocation()
  const { user } = useAuthStore()
  const { data: project, isLoading, error } = useProject(id)
  const { data: riskAssessment, isLoading: riskLoading } = useRiskAssessment(id)

  const [activeTab, setActiveTab] = useState<'overview' | 'financials' | 'risk' | 'faq'>('overview')
  const [amount, setAmount] = useState(100)

  if (isLoading) {
    return (
      <DashboardLayout currentPath={location.pathname}>
        <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-96 w-full rounded-3xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-48 w-full rounded-2xl" />
              <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
            <Skeleton className="h-96 w-full rounded-2xl" />
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !project) {
    return (
      <DashboardLayout currentPath={location.pathname}>
        <EmptyState
          title="Opportunité introuvable"
          description="Cette opportunité n'existe pas ou la campagne est clôturée."
          action={
            <Link to="/projects">
              <Button variant="accent">Retour aux opportunités</Button>
            </Link>
          }
        />
      </DashboardLayout>
    )
  }

  const minInvest = project.minimum_investment || 50
  const expectedReturn = project.expected_return || 9.5
  const percent = Math.min(Math.round((project.collected_amount / project.target_amount) * 100), 100)
  const canInvest = user?.role === 'INVESTOR' && project.status === 'PUBLISHED'
  
  // Real-time calculated returns
  const simAmount = Math.max(minInvest, amount)
  const annualGain = simAmount * (expectedReturn / 100)
  const totalReturn = annualGain * ((project.duration_months || 24) / 12)
  const totalPayback = simAmount + totalReturn

  return (
    <DashboardLayout currentPath={location.pathname}>
      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
        {/* Breadcrumb */}
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Toutes les opportunités
        </Link>

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-gradient-to-br from-[#060a13] via-[#0c1221] to-[#131d30] text-white p-6 sm:p-10 shadow-xl">
          {/* Background image & gradient overlay */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-overlay"
            style={{
              backgroundImage: `url(${project.image || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80'})`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060a13] via-[#060a13]/70 to-transparent" />

          <div className="relative z-10 space-y-4 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white backdrop-blur-md border border-white/15">
                {project.category || 'Projet'}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {project.status === 'PUBLISHED' ? 'Campagne Ouverte' : project.status}
              </span>
              <RiskBadge level={project.risk_level} />
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              {project.title}
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
              {project.description}
            </p>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-xs font-medium text-slate-300 border-t border-white/10">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-[var(--accent)]" />
                Durée : {project.duration_months} mois
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-emerald-400" />
                {project.investor_count || 0} investisseurs participants
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-sky-400" />
                Séquestre bancaire certifié
              </span>
            </div>
          </div>
        </div>

        {/* Campaign Funding Progress Banner */}
        <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Montant Collecté</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-[var(--text-primary)] font-mono">
                  {formatCurrency(project.collected_amount)}
                </span>
                <span className="text-sm font-semibold text-[var(--text-muted)]">
                  sur {formatCurrency(project.target_amount)}
                </span>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-2xl font-extrabold text-[var(--accent)] font-mono">{percent}%</span>
              <p className="text-xs text-[var(--text-muted)]">de l'objectif atteint</p>
            </div>
          </div>

          <ProgressBar value={project.collected_amount} max={project.target_amount} size="lg" color="primary" />
        </div>

        {/* 2-Column Grid: Details Tabs & Sticky Investment Box */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content Area (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs Navigation */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[var(--border-subtle)]">
              {[
                { id: 'overview', label: 'Présentation & Thèse' },
                { id: 'financials', label: 'Données financières' },
                { id: 'risk', label: 'Analyse des risques' },
                { id: 'faq', label: 'Documents & FAQ' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`pb-3 px-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-[var(--accent)] text-[var(--accent)]'
                      : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab: Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <Card>
                  <CardTitle className="mb-4">Thèse d'investissement</CardTitle>
                  <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                    {project.description}
                  </p>
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-[var(--border-subtle)]">
                    <div className="p-4 rounded-2xl bg-[var(--surface-secondary)] border border-[var(--border-subtle)]">
                      <Target className="h-5 w-5 text-[var(--accent)] mb-2" />
                      <h4 className="text-xs font-bold text-[var(--text-primary)]">Modèle économique éprouvé</h4>
                      <p className="text-[11px] text-[var(--text-muted)] mt-1">Génération de flux de trésorerie prévisibles et adossés à des actifs réels.</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-[var(--surface-secondary)] border border-[var(--border-subtle)]">
                      <ShieldCheck className="h-5 w-5 text-emerald-500 mb-2" />
                      <h4 className="text-xs font-bold text-[var(--text-primary)]">Sûretés & Garanties</h4>
                      <p className="text-[11px] text-[var(--text-muted)] mt-1">Pacte d'actionnaires protecteur et clauses de priorité de remboursement.</p>
                    </div>
                  </div>
                </Card>

                <Card>
                  <CardTitle className="mb-4">Points Clés du Projet</CardTitle>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    <div className="p-3 rounded-xl bg-[var(--surface-secondary)]">
                      <p className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Rendement</p>
                      <p className="text-lg font-extrabold text-[var(--success)] mt-1">+{expectedReturn}%</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[var(--surface-secondary)]">
                      <p className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Horizon</p>
                      <p className="text-lg font-extrabold text-[var(--text-primary)] mt-1">{project.duration_months} mois</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[var(--surface-secondary)]">
                      <p className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Ticket Min.</p>
                      <p className="text-lg font-extrabold text-[var(--text-primary)] mt-1">{formatCurrency(minInvest)}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[var(--surface-secondary)]">
                      <p className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Risque</p>
                      <p className="text-lg font-extrabold text-[var(--text-primary)] mt-1">{project.risk_level}</p>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Tab: Financials */}
            {activeTab === 'financials' && (
              <Card>
                <CardTitle className="mb-4">Informations Financières & Structuration</CardTitle>
                <div className="divide-y divide-[var(--border-subtle)] text-sm">
                  <div className="flex items-center justify-between py-3.5">
                    <span className="text-[var(--text-secondary)]">Taux de rendement contractuel</span>
                    <span className="font-extrabold text-[var(--success)]">+{expectedReturn}% / an</span>
                  </div>
                  <div className="flex items-center justify-between py-3.5">
                    <span className="text-[var(--text-secondary)]">Durée d'emprunt / détention</span>
                    <span className="font-bold text-[var(--text-primary)]">{project.duration_months} mois</span>
                  </div>
                  <div className="flex items-center justify-between py-3.5">
                    <span className="text-[var(--text-secondary)]">Versement des coupons</span>
                    <span className="font-bold text-[var(--text-primary)]">Trimestriel / In fine</span>
                  </div>
                  <div className="flex items-center justify-between py-3.5">
                    <span className="text-[var(--text-secondary)]">Objectif total de financement</span>
                    <span className="font-bold text-[var(--text-primary)] font-mono">{formatCurrency(project.target_amount)}</span>
                  </div>
                </div>
              </Card>
            )}

            {/* Tab: Risk */}
            {activeTab === 'risk' && (
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <CardTitle>Évaluation Indépendante des Risques</CardTitle>
                  <RiskBadge level={project.risk_level} />
                </div>
                {riskAssessment ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 rounded-xl bg-[var(--surface-secondary)]">
                        <span className="text-xs font-semibold text-[var(--text-muted)]">Score de risque</span>
                        <p className="text-2xl font-extrabold text-[var(--text-primary)] mt-1">{riskAssessment.risk_score} / 100</p>
                      </div>
                      <div className="p-4 rounded-xl bg-[var(--surface-secondary)]">
                        <span className="text-xs font-semibold text-[var(--text-muted)]">Probabilité de défaut</span>
                        <p className="text-2xl font-extrabold text-[var(--text-primary)] mt-1">{riskAssessment.probability}%</p>
                      </div>
                      <div className="p-4 rounded-xl bg-[var(--surface-secondary)]">
                        <span className="text-xs font-semibold text-[var(--text-muted)]">Impact résiduel</span>
                        <p className="text-2xl font-extrabold text-[var(--text-primary)] mt-1">{riskAssessment.impact}%</p>
                      </div>
                    </div>
                    {riskAssessment.explanation && (
                      <div className="p-4 rounded-2xl bg-[var(--accent-light)] border border-[var(--accent-muted)] text-xs text-[var(--text-primary)]">
                        <p className="font-bold mb-1">Rapport de conformité des analystes :</p>
                        <p>{riskAssessment.explanation}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-[var(--text-muted)]">Rapport de cotation en cours de publication.</p>
                )}
              </Card>
            )}

            {/* Tab: FAQ */}
            {activeTab === 'faq' && (
              <Card>
                <CardTitle className="mb-4">Documents Légaux & FAQ</CardTitle>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-secondary)]">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-[var(--accent)]" />
                      <div>
                        <p className="text-xs font-bold text-[var(--text-primary)]">Document d'Information Synthétique (DIS)</p>
                        <p className="text-[10px] text-[var(--text-muted)]">PDF certifié AMF (1.4 Mo)</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Consulter</Button>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Sticky Investment Simulator (1 Col) */}
          <div className="lg:sticky lg:top-24 lg:self-start space-y-4">
            <Card className="border-[var(--border-default)] shadow-lg">
              <CardTitle className="text-base mb-1">Simulateur d'investissement</CardTitle>
              <p className="text-xs text-[var(--text-muted)] mb-5">Calculez vos rendements prévisionnels</p>

              {canInvest ? (
                <div className="space-y-5">
                  {/* Amount Stepper */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      Montant à allouer (€)
                    </label>
                    <div className="flex items-center rounded-2xl border border-[var(--border-default)] bg-[var(--surface-primary)] p-1">
                      <button
                        type="button"
                        onClick={() => setAmount(Math.max(minInvest, amount - 100))}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--accent)] hover:text-white transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <input
                        type="number"
                        value={amount}
                        min={minInvest}
                        step="50"
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className="flex-1 text-center font-extrabold text-lg bg-transparent text-[var(--text-primary)] focus:outline-none font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setAmount(amount + 100)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--accent)] hover:text-white transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] text-right">Ticket min. : {formatCurrency(minInvest)}</p>
                  </div>

                  {/* Return Simulation Breakdown */}
                  <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-4 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-secondary)]">Montant souscrit</span>
                      <span className="font-bold text-[var(--text-primary)] font-mono">{formatCurrency(simAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-secondary)]">Taux contractuel</span>
                      <span className="font-bold text-[var(--success)]">+{expectedReturn}% / an</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-secondary)]">Intérêts estimés</span>
                      <span className="font-bold text-[var(--success)] font-mono">+{formatCurrency(totalReturn)}</span>
                    </div>
                    <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between font-extrabold text-sm">
                      <span className="text-[var(--text-primary)]">Total récupéré</span>
                      <span className="text-[var(--accent)] font-mono">{formatCurrency(totalPayback)}</span>
                    </div>
                  </div>

                  <Link to={`/investments/new?project=${project.id}&amount=${simAmount}`} className="block">
                    <Button variant="accent" size="lg" className="w-full shadow-lg shadow-[var(--accent)]/25">
                      Souscrire à cette opportunité
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>

                  <p className="text-[10px] text-center text-[var(--text-muted)] leading-tight">
                    Fonds séquestrés chez un dépositaire agréé. Aucun frais de souscription caché.
                  </p>
                </div>
              ) : user ? (
                <div className="text-center py-6 space-y-3">
                  <p className="text-xs text-[var(--text-muted)]">
                    {project.status !== 'PUBLISHED' ? "Cette campagne n'est plus ouverte aux investissements." : "Votre profil ne permet pas de souscrire directement."}
                  </p>
                  <Link to="/projects">
                    <Button variant="outline" size="sm" className="w-full">Voir les autres projets</Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-6 space-y-3">
                  <p className="text-xs text-[var(--text-muted)]">Connectez-vous pour simuler et investir dans ce projet.</p>
                  <Link to="/login" className="block">
                    <Button variant="accent" size="md" className="w-full">Se connecter pour investir</Button>
                  </Link>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
