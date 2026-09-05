import { Link } from 'react-router-dom'
import { PublicLayout } from '@/components/layout'
import { Button } from '@/components/common'
import { usePublicStats } from '@/hooks'
import { Shield, TrendingUp, Users, Target, ArrowRight, Sparkles } from 'lucide-react'

export default function AboutPage() {
  const { data: publicStats } = usePublicStats()
  const investorCount = publicStats?.total_investors || 0

  const values = [
    { icon: Shield, title: 'Sécurité & Rigueur', description: 'Comptes séquestres agréés, audit financier strict et conformité AMF / UE.' },
    { icon: TrendingUp, title: 'Rendement & Impact', description: 'Des projets innovants sélectionnés pour offrir une performance financière durable.' },
    { icon: Users, title: 'Force Collective', description: `Rejoignez une communauté de plus de ${investorCount} investisseurs engagés.` },
    { icon: Target, title: 'Transparence Absolue', description: "Accès complet aux audits, rapports trimestriels et indicateurs en temps réel." },
  ]

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[var(--bg-primary)] py-20 lg:py-28 text-[var(--text-primary)] border-b border-[var(--border-subtle)]">
        <div className="container relative z-10 mx-auto max-w-4xl text-center px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[var(--accent)] shadow-xs mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Notre Raison d'Être</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[var(--text-primary)] leading-tight text-center">
            Plateforme Fintech d'Investissement Participatif
          </h1>
        </div>
      </section>

      {/* Values / Nos Engagements */}
      <section className="bg-[var(--bg-secondary)] py-20 lg:py-28">
        <div className="container mx-auto max-w-[1240px] px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
            <span className="section-pill-tag mx-auto inline-flex">Nos Engagements</span>
            <h2 className="section-title text-center mt-3">Les piliers de notre modèle</h2>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <div
                key={value.title}
                className="feature-box-fintech group text-center flex flex-col items-center p-6"
              >
                <div className="feature-icon-fintech mb-4">
                  <value.icon className="h-6 w-6 text-[var(--accent)]" />
                </div>
                <h3 className="feature-title-fintech text-center font-bold text-base">{value.title}</h3>
                <span className="mt-2 text-xs font-semibold text-[var(--text-muted)] bg-[var(--bg-primary)] px-3 py-1 rounded-full border border-[var(--border-subtle)]">
                  {value.description}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[var(--bg-primary)] py-20 lg:py-24 text-center border-t border-[var(--border-subtle)]">
        <div className="container mx-auto max-w-2xl px-4 sm:px-6 text-center">
          <span className="section-pill-tag mx-auto inline-flex mb-3">Rejoignez-nous</span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--text-primary)] text-center">
            Prêt à investir dans des projets d'avenir ?
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[var(--text-secondary)] text-center max-w-lg mx-auto">
            Créez votre compte en 2 minutes et commencez à diversifier votre épargne dès 50 €.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link to="/register" className="w-full sm:w-auto">
              <Button size="xl" variant="primary" className="w-full sm:w-auto font-semibold">
                Commencer maintenant
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link to="/projects" className="w-full sm:w-auto">
              <Button size="xl" variant="outline" className="w-full sm:w-auto font-semibold">
                Découvrir les opportunités
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
