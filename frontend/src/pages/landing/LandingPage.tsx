import { Link } from 'react-router-dom'
import { useProjects, usePublicStats } from '@/hooks'
import { Button, ProjectCard, Skeleton } from '@/components/common'
import { PublicHeader, Footer } from '@/components/layout'
import { formatCompactNumber } from '@/utils'
import type { Project } from '@/types'
import {
  Shield, Search, TrendingUp, Wallet, BarChart3, ArrowRight,
  CheckCircle2, Users, Sparkles, Building2, ShieldCheck,
  Lock, ArrowUpRight, Check,
} from 'lucide-react'

const steps = [
  {
    number: '01',
    title: 'Découvrez les projets',
    description: 'Sélection & Audits AMF',
    icon: Search,
  },
  {
    number: '02',
    title: 'Investissez dès 50 €',
    description: 'Paiement sécurisé agrégé',
    icon: Wallet,
  },
  {
    number: '03',
    title: 'Suivez vos rendements',
    description: 'Valorisation temps réel',
    icon: TrendingUp,
  },
]

const benefits = [
  {
    icon: Search,
    title: 'Transparence totale',
    description: 'Audits & États financiers',
  },
  {
    icon: BarChart3,
    title: 'Diversification active',
    description: 'Énergie, Immobilier & Tech',
  },
  {
    icon: Sparkles,
    title: 'Accessible dès 50 €',
    description: 'Zéro frais masqués',
  },
  {
    icon: Shield,
    title: 'Sécurité & Garanties',
    description: 'Comptes séquestres agréés',
  },
]

const trustFeatures = [
  {
    icon: ShieldCheck,
    title: 'Plateforme régulée',
    desc: 'Normes AMF & Standards UE',
  },
  {
    icon: CheckCircle2,
    title: 'Audit approfondi',
    desc: '< 5% dossiers sélectionnés',
  },
  {
    icon: Lock,
    title: 'Ségrégation des fonds',
    desc: 'Comptes dépositaires cantonnés',
  },
  {
    icon: Users,
    title: 'Investisseurs actifs',
    desc: 'Une communauté financière active échangeant sur les opportunités et partageant les succès.',
  },
]
export default function LandingPage() {
  const { data, isLoading: projectsLoading } = useProjects({ page_size: 6, status: 'PUBLISHED' })
  const { data: publicStats, isLoading: statsLoading } = usePublicStats()

  const projects = data?.results || []
  const featuredProject = projects[0] || null
  const avgReturn = projects.length > 0
    ? (projects.reduce((sum, p) => sum + (p.expected_return || 0), 0) / projects.length).toFixed(1)
    : '—'

  const statItems = [
    {
      value: publicStats?.total_projects ? `${publicStats.total_projects}+` : statsLoading ? '' : '0',
      label: 'Projets financés',
      icon: Building2,
    },
    {
      value: publicStats?.total_volume ? formatCompactNumber(publicStats.total_volume, '€') : statsLoading ? '' : '0 €',
      label: 'Volume investi',
      icon: TrendingUp,
    },
    {
      value: publicStats?.total_investors ? formatCompactNumber(publicStats.total_investors) : statsLoading ? '' : '0',
      label: 'Investisseurs actifs',
      icon: Users,
    },
    {
      value: publicStats?.success_rate ? `${publicStats.success_rate}%` : statsLoading ? '' : '0%',
      label: 'Taux de succès',
      icon: Sparkles,
    },
  ]

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans antialiased">
      <PublicHeader variant="transparent" />

      {/* ==================================================================
          HERO
          ================================================================== */}
      <section className="hero-fintech">
        <div className="hero-glow-magenta" />
        <div className="hero-glow-cyan" />
        <div className="hero-glow-navy" />
        <div className="hero-grid-pattern" />

        <div className="container relative z-10 w-full">
          <div className="hero-grid">
            {/* Left */}
            <div>
              <div className="pill-tag">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Plateforme d'investissement participatif</span>
              </div>

              <h1 className="hero-headline">
                Investissez dans les{' '}
                <span className="hero-headline-accent">
                  entreprises de demain.
                </span>
              </h1>

              <p className="hero-description">
                Participez au financement d'entreprises innovantes, rentables et à fort impact. Développez votre patrimoine dès 50 € aux côtés de plus de {publicStats?.total_investors?.toLocaleString('fr-FR') || '10 000+'} investisseurs.
              </p>

              <div className="hero-cta-group">
                <Link to="/projects" className="w-full sm:w-auto">
                  <Button size="xl" variant="primary" className="w-full sm:w-auto">
                    Découvrir les opportunités
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <a href="#how-it-works" className="w-full sm:w-auto">
                  <Button size="xl" variant="outline" className="w-full sm:w-auto">
                    Comment ça marche
                  </Button>
                </a>
              </div>

              <div className="hero-trust-list">
                <div className="hero-trust-item">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Projets 100% audités</span>
                </div>
                <div className="hero-trust-item">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Accessible dès 50 €</span>
                </div>
                <div className="hero-trust-item">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Comptes séquestres agréés</span>
                </div>
              </div>
            </div>

            {/* Right: Fintech Showcase */}
            <div className="fintech-showcase-wrap animate-float">
              <div className="fintech-security-pill">
                <div className="fintech-security-icon">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="fintech-security-title">Plateforme Enregistrée</p>
                  <p className="fintech-security-subtitle">Régulation AMF / UE</p>
                </div>
              </div>

              <div className="fintech-card-main">
                <div className="fintech-card-header">
                  <span className="fintech-card-badge">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)] animate-pulse" />
                    Levée en cours
                  </span>
                  <span className="text-xs font-semibold text-[var(--text-muted)]">{featuredProject?.risk_type || 'Projet'}</span>
                </div>

                <div className="fintech-card-img-wrap">
                  <img
                    src={featuredProject?.image || 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=800&q=80'}
                    alt={featuredProject?.title || 'Projet vedette'}
                  />
                  <div className="fintech-card-img-overlay" />
                  <span className="fintech-card-img-tag">{featuredProject?.category || 'Investissement'}</span>
                </div>

                <div className="fintech-card-info">
                  <h3 className="fintech-card-title">{featuredProject?.title || 'Aucun projet disponible'}</h3>
                  <p className="fintech-card-category">{featuredProject?.description?.slice(0, 80) || ''}...</p>
                </div>

                <div className="fintech-metrics-row">
                  <div className="flex flex-col">
                    <span className="fintech-metric-label">Objectif</span>
                    <span className="fintech-metric-value">{featuredProject?.target_amount ? formatCompactNumber(featuredProject.target_amount, '€') : '—'}</span>
                  </div>
                  <div className="fintech-metric-item text-right">
                    <span className="fintech-metric-label">Collecté ({featuredProject?.target_amount && featuredProject?.collected_amount ? Math.round((featuredProject.collected_amount / featuredProject.target_amount) * 100) : 0}%)</span>
                    <span className="fintech-metric-value text-pink-400">{featuredProject?.collected_amount ? formatCompactNumber(featuredProject.collected_amount, '€') : '—'}</span>
                  </div>
                </div>

                <div className="fintech-progress-track">
                  <div className="fintech-progress-bar" style={{ width: featuredProject?.target_amount && featuredProject?.collected_amount ? `${Math.min(100, Math.round((featuredProject.collected_amount / featuredProject.target_amount) * 100))}%` : '0%' }} />
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-[var(--text-secondary)]">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                    <span>{featuredProject?.investor_count || 0} souscripteurs</span>
                  </div>
                  <div className="flex items-center gap-1 font-bold text-[var(--success)]">
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span>+{featuredProject?.expected_return || 0}% net / an</span>
                  </div>
                </div>
              </div>

              <div className="fintech-floating-pill">
                <div className="fintech-floating-icon">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div>
                  <p className="fintech-floating-title">Rendement moyen cible</p>
                  <p className="fintech-floating-value">+{avgReturn}% net / an</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================
          STATS STRIP
          ================================================================== */}
      <section className="stats-ribbon-section container">
        <div className="stats-ribbon-card">
          <div className="stats-ribbon-grid">
            {statsLoading ? (
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col items-center justify-center p-4">
                  <Skeleton className="h-10 w-24 rounded-xl" />
                  <Skeleton className="mt-2 h-4 w-32 rounded-md" />
                </div>
              ))
            ) : (
              statItems.map((stat) => (
                <div key={stat.label} className="stats-ribbon-item">
                  <div className="flex items-center gap-2">
                    <stat.icon className="h-5 w-5 text-[var(--accent)]" />
                    <span className="stats-ribbon-number">{stat.value}</span>
                  </div>
                  <span className="stats-ribbon-label">{stat.label}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ==================================================================
          OPPORTUNITIES
          ================================================================== */}
      <section className="section bg-[var(--bg-primary)]">
        <div className="container">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end mb-10 sm:mb-12">
            <div>
              <span className="section-pill-tag">
                <Sparkles className="h-3.5 w-3.5" />
                Sélection du moment
              </span>
              <h2 className="section-title">Opportunités à découvrir</h2>
              <p className="section-desc">
                Une sélection d'entreprises à fort potentiel et à modèle économique validé,
                actuellement ouvertes à la souscription.
              </p>
            </div>
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-5 py-3 text-sm font-bold text-[var(--text-primary)] shadow-sm transition-all duration-200 hover:border-[var(--accent-muted)] hover:shadow-md"
            >
              Voir toutes les opportunités
              <ArrowUpRight className="h-4 w-4 text-[var(--accent)]" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projectsLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4 shadow-sm">
                  <Skeleton className="aspect-[16/10] w-full rounded-xl" />
                  <div className="space-y-4 p-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-2 w-full rounded-full" />
                  </div>
                </div>
              ))
            ) : projects.length === 0 ? (
              <div className="col-span-full py-16 text-center">
                <p className="text-slate-400">Aucun projet actif pour le moment.</p>
              </div>
            ) : (
              projects.slice(0, 6).map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* ==================================================================
          HOW IT WORKS
          ================================================================== */}
      <section id="how-it-works" className="section bg-[var(--bg-secondary)]">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <span className="section-pill-tag">Processus simplifié</span>
            <h2 className="section-title">Comment ça marche</h2>
            <p className="section-desc mx-auto">
              Trois étapes transparentes et sécurisées pour commencer à diversifier vos investissements.
            </p>
          </div>

          <div className="steps-container">
            <div className="steps-connecting-line" />
            {steps.map((step) => (
              <div key={step.number} className="step-box">
                <div className="step-icon-wrapper">
                  <step.icon />
                  <span className="step-number-pill">{step.number}</span>
                </div>
                <h3 className="step-box-title">{step.title}</h3>
                <p className="step-box-description">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================================================================
          WHY INVEST
          ================================================================== */}
      <section className="section bg-[var(--bg-primary)]">
        <div className="container">
          <div className="why-invest-grid">
            <div>
              <span className="section-pill-tag">Nos Avantages</span>
              <h2 className="section-title">Pourquoi investir avec Fundsy</h2>
              <p className="section-desc">
                Nous combinons la rigueur des fonds de capital-investissement traditionnels
                avec la simplicité et la liquidité des technologies fintech 2026.
              </p>

              <div className="check-list mt-8">
                <div className="check-item">
                  <div className="check-item-icon"><Check className="h-3.5 w-3.5" /></div>
                  <span>Sélection rigoureuse : moins de 5% de dossiers retenus</span>
                </div>
                <div className="check-item">
                  <div className="check-item-icon"><Check className="h-3.5 w-3.5" /></div>
                  <span>Marché secondaire intégré pour céder vos parts à tout moment</span>
                </div>
                <div className="check-item">
                  <div className="check-item-icon"><Check className="h-3.5 w-3.5" /></div>
                  <span>Zéro frais de tenue de compte ni commission d'entrée cachée</span>
                </div>
              </div>

              <div className="mt-10">
                <Link to="/register">
                  <Button size="lg" variant="primary">
                    Ouvrir un compte investisseur
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="features-2x2-grid">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="feature-box-fintech">
                  <div className="feature-icon-fintech">
                    <benefit.icon />
                  </div>
                  <h3 className="feature-title-fintech">{benefit.title}</h3>
                  <p className="feature-desc-fintech">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================
          TRUST & SECURITY
          ================================================================== */}
      <section className="section trust-section">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <span className="section-pill-tag">
              <ShieldCheck className="h-3.5 w-3.5" />
              Sécurité & Régulation
            </span>
            <h2 className="section-title">Une plateforme de confiance</h2>
            <p className="section-desc mx-auto">
              La rigueur analytique, la conformité réglementaire européenne et la ségrégation
              des fonds au service direct de vos placements.
            </p>
          </div>

          <div className="trust-pillars-grid">
            {trustFeatures.map((feature) => (
              <div key={feature.title} className="trust-pillar-card">
                <div className="trust-pillar-icon">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="trust-pillar-title">{feature.title}</h3>
                <p className="trust-pillar-desc">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* CLOSING CTA */}
          <div className="closing-cta-card">
            <div className="closing-cta-glow" />
            <h3 className="closing-cta-title">
              Trouvez votre prochaine opportunité d'investissement
            </h3>
            <p className="closing-cta-desc">
              Rejoignez dès aujourd'hui des milliers d'investisseurs et donnez du sens
              à votre épargne tout en visant des rendements performants.
            </p>
            <div className="closing-cta-buttons">
              <Link to="/projects" className="w-full sm:w-auto">
                <Button size="xl" variant="primary" className="w-full sm:w-auto font-bold">
                  Découvrir les opportunités
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link to="/register" className="w-full sm:w-auto">
                <Button size="xl" variant="outline" className="w-full sm:w-auto font-bold">
                  Créer un compte
                </Button>
              </Link>
            </div>
            <p className="relative z-10 mt-6 text-xs text-[var(--text-muted)] max-w-lg mx-auto">
              L'investissement dans des entreprises comporte des risques de perte partielle ou totale en capital
              et d'illiquidité. Diversifiez vos investissements.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
