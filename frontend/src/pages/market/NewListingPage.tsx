import { useState, useCallback } from 'react'
import { useLocation, useSearchParams, Link } from 'react-router-dom'
import { useInvestments, useCreateListing } from '@/hooks'
import { Card, Button, Skeleton, EmptyState, Badge, WizardLayout } from '@/components/common'
import { DashboardLayout } from '@/components/layout'
import { formatCurrency, formatPercent } from '@/utils'
import { ArrowLeft, ArrowRight, CheckCircle2, Tag, TrendingUp, AlertCircle } from 'lucide-react'

const steps = [
  { label: 'Sélection' },
  { label: 'Prix' },
  { label: 'Récapitulatif' },
  { label: 'Confirmation' },
]

export default function NewListingPage() {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const initialInvestment = searchParams.get('investment')

  const { data, isLoading } = useInvestments({ page_size: 50 })
  const createListing = useCreateListing()

  const [step, setStep] = useState(1)
  const [selectedId, setSelectedId] = useState<number | null>(initialInvestment ? Number(initialInvestment) : null)
  const [price, setPrice] = useState(0)
  const [createdListingId, setCreatedListingId] = useState<number | null>(null)

  const investments = (data?.results || []).map((inv: any) => ({
    id: inv.id,
    projectTitle: inv.project_detail?.title || `Project #${inv.project}`,
    projectId: inv.project,
    amount: inv.amount,
    currentValue: inv.current_value || inv.amount,
    performance: inv.performance || 0,
    duration: inv.project_detail?.duration_months ? `${inv.project_detail.duration_months} months` : 'N/A',
    return: inv.project_detail?.expected_return || 0,
    sector: inv.project_detail?.risk_type || 'Project',
  }))

  const selected = investments.find((i: any) => i.id === selectedId) || null
  const displayPrice = price || (selected?.amount ?? 0)

  const handlePublish = useCallback(async () => {
    if (!selected) return
    try {
      const result = await createListing.mutateAsync({ investment_id: selected.id, price: displayPrice })
      setCreatedListingId((result.data as any)?.id || selected.id)
      setStep(4)
    } catch {
      // Error handled by query
    }
  }, [selected, displayPrice, createListing])

  const handleNext = useCallback(() => {
    if (step === 1 && selected) {
      setStep(2)
    } else if (step === 2 && displayPrice >= 1) {
      setStep(3)
    } else if (step === 3) {
      handlePublish()
    }
  }, [step, selected, displayPrice, handlePublish])

  const handleBack = useCallback(() => {
    if (step === 2) setStep(1)
    else if (step === 3) setStep(2)
  }, [step])

  const isNextDisabled =
    (step === 1 && !selected) ||
    (step === 2 && displayPrice < 1) ||
    (step === 3 && createListing.isPending)

  const nextLabel = step === 3 ? "Publier l'annonce" : 'Continuer'

  if (isLoading) {
    return (
      <DashboardLayout currentPath={location.pathname}>
        <div className="mx-auto max-w-3xl space-y-6">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout currentPath={location.pathname}>
      <div className="mx-auto max-w-3xl space-y-6">
        <Link
          to="/market"
          className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au marché secondaire
        </Link>

        <div>
          <h1 style={{ color: 'var(--text-primary)' }} className="text-3xl font-bold tracking-tight lg:text-[32px]">
            Vendre mes parts
          </h1>
          <p style={{ color: 'var(--text-secondary)' }} className="mt-2 text-base">
            Mettez en vente vos parts d'investissement sur le marché secondaire.
          </p>
        </div>

        <WizardLayout
          steps={steps}
          currentStep={step}
          onStepChange={setStep}
          onNext={handleNext}
          onBack={handleBack}
          nextLabel={nextLabel}
          nextDisabled={isNextDisabled}
          showNavigation={step < 4}
        >
          {/* Step 1 — Select investment */}
          {step === 1 && (
            <Card>
              <h2 style={{ color: 'var(--text-primary)' }} className="text-xl font-bold">Sélectionnez l'investissement à vendre</h2>
              <p style={{ color: 'var(--text-secondary)' }} className="mt-2 text-sm">Choisissez l'investissement dont vous souhaitez vendre des parts.</p>

              {investments.length === 0 ? (
                <div className="mt-6">
                  <EmptyState
                    title="Aucun investissement"
                    description="Vous devez d'abord investir dans un projet pour pouvoir vendre vos parts."
                    action={<Link to="/projects"><Button>Découvrir les opportunités</Button></Link>}
                  />
                </div>
              ) : (
                <div className="mt-6 space-y-3">
                  {investments.map((inv: any) => {
                    const isSelected = selectedId === inv.id
                    return (
                      <button
                        key={inv.id}
                        onClick={() => { setSelectedId(inv.id); setPrice(inv.amount) }}
                        className="flex w-full items-center gap-4 rounded-xl p-4 text-left transition-all"
                        style={{
                          border: isSelected ? '2px solid var(--accent)' : '1px solid var(--border-subtle)',
                          background: isSelected ? 'var(--accent-muted)' : 'var(--surface-primary)',
                        }}
                      >
                        <div
                          className="flex h-12 w-12 items-center justify-center rounded-xl shrink-0"
                          style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}
                        >
                          <TrendingUp className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 style={{ color: 'var(--text-primary)' }} className="text-sm font-semibold truncate">{inv.projectTitle}</h3>
                            <Badge variant="default">{inv.sector}</Badge>
                          </div>
                          <p style={{ color: 'var(--text-muted)' }} className="mt-1 text-xs">{inv.duration}</p>
                        </div>
                        <div className="text-right">
                          <p style={{ color: 'var(--text-primary)' }} className="text-sm font-bold">{formatCurrency(inv.amount)}</p>
                          {inv.performance !== 0 && (
                            <p
                              className="text-xs font-semibold"
                              style={{ color: inv.performance >= 0 ? 'var(--success)' : 'var(--error)' }}
                            >
                              {inv.performance >= 0 ? '+' : ''}{formatPercent(inv.performance)}
                            </p>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </Card>
          )}

          {/* Step 2 — Set price */}
          {step === 2 && selected && (
            <Card>
              <h2 style={{ color: 'var(--text-primary)' }} className="text-xl font-bold">Définissez votre prix</h2>
              <p style={{ color: 'var(--text-secondary)' }} className="mt-2 text-sm">Fixez le prix de vente de vos parts.</p>

              <div className="mt-6 rounded-2xl p-4" style={{ background: 'var(--surface-secondary)' }}>
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}
                  >
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 style={{ color: 'var(--text-primary)' }} className="text-sm font-semibold">{selected.projectTitle}</h3>
                    <p style={{ color: 'var(--text-muted)' }} className="text-xs">Investissement initial : {formatCurrency(selected.amount)}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label style={{ color: 'var(--text-muted)' }} className="text-xs font-semibold uppercase tracking-wider">Prix de vente</label>
                <div className="relative mt-2">
                  <input
                    type="number"
                    value={displayPrice}
                    onChange={(e) => setPrice(Math.max(1, Number(e.target.value)))}
                    className="input-fintech w-full pl-4 pr-12 text-2xl font-bold"
                  />
                  <span style={{ color: 'var(--text-muted)' }} className="absolute right-4 top-1/2 -translate-y-1/2 text-base font-semibold">€</span>
                </div>
                <div style={{ color: 'var(--text-muted)' }} className="mt-3 flex items-center justify-between text-xs">
                  <span>Min : 1 €</span>
                  <span>Investissement initial : {formatCurrency(selected.amount)}</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-2">
                {[
                  { label: '-10%', value: Math.round(selected.amount * 0.9) },
                  { label: 'Prix initial', value: selected.amount },
                  { label: '+10%', value: Math.round(selected.amount * 1.1) },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => setPrice(preset.value)}
                    className="btn btn-outline btn-md"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <div className="mt-6 rounded-xl p-4" style={{ background: 'var(--accent-muted)' }}>
                <div className="flex items-start gap-3">
                  <Tag className="mt-0.5 h-5 w-5" style={{ color: 'var(--accent)' }} />
                  <div>
                    <p style={{ color: 'var(--text-primary)' }} className="text-sm font-semibold">Estimation du prix</p>
                    <p style={{ color: 'var(--text-secondary)' }} className="mt-1 text-xs">
                      Vous proposez de vendre vos parts à <strong>{formatCurrency(displayPrice)}</strong>.
                      {displayPrice !== selected.amount && (
                        <> Soit {displayPrice > selected.amount ? '+' : ''}{formatPercent(((displayPrice - selected.amount) / selected.amount) * 100)} par rapport au prix initial.</>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Step 3 — Summary */}
          {step === 3 && selected && (
            <Card>
              <h2 style={{ color: 'var(--text-primary)' }} className="text-xl font-bold">Récapitulatif</h2>
              <p style={{ color: 'var(--text-secondary)' }} className="mt-2 text-sm">Vérifiez les informations avant de publier votre annonce.</p>

              <div className="mt-6 rounded-2xl p-6" style={{ background: 'var(--surface-secondary)' }}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 style={{ color: 'var(--text-primary)' }} className="text-lg font-bold">{selected.projectTitle}</h3>
                    <p style={{ color: 'var(--text-muted)' }} className="mt-1 text-xs">{selected.sector}</p>
                  </div>
                  <Badge variant="info">En vente</Badge>
                </div>
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between pb-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <span style={{ color: 'var(--text-secondary)' }} className="text-sm">Prix de vente</span>
                    <span style={{ color: 'var(--text-primary)' }} className="text-lg font-bold">{formatCurrency(displayPrice)}</span>
                  </div>
                  <div className="flex items-center justify-between pb-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <span style={{ color: 'var(--text-secondary)' }} className="text-sm">Prix initial</span>
                    <span style={{ color: 'var(--text-secondary)' }} className="text-sm font-semibold">{formatCurrency(selected.amount)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ color: 'var(--text-primary)' }} className="text-sm font-semibold">Vous recevrez</span>
                    <span style={{ color: 'var(--success)' }} className="text-xl font-bold">{formatCurrency(displayPrice)}</span>
                  </div>
                </div>
              </div>

              <div
                className="mt-6 flex items-start gap-3 rounded-xl p-4"
                style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}
              >
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <p className="text-sm">
                  Vérifiez votre annonce avant de continuer. Une fois publiée, vous pourrez l'annuler à tout moment depuis "Mes annonces".
                </p>
              </div>

              {createListing.isError && (
                <div
                  className="mt-4 flex items-start gap-3 rounded-xl p-4"
                  style={{ background: 'var(--error-light)', color: 'var(--error)' }}
                >
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                  <p className="text-sm">
                    Une erreur est survenue lors de la publication de l'annonce. Veuillez réessayer.
                  </p>
                </div>
              )}
            </Card>
          )}
        </WizardLayout>

        {/* Step 4 — Success */}
        {step === 4 && selected && (
          <Card>
            <div className="text-center">
              <div
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-full"
                style={{ background: 'var(--success-light)', color: 'var(--success)' }}
              >
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 style={{ color: 'var(--text-primary)' }} className="mt-6 text-2xl font-bold tracking-tight">
                Annonce publiée
              </h2>
              <p style={{ color: 'var(--text-secondary)' }} className="mt-3 text-sm">
                Votre annonce pour <span style={{ color: 'var(--text-primary)' }} className="font-semibold">{selected.projectTitle}</span> a été publiée sur le marché secondaire.
              </p>
            </div>

            <div className="mt-8 rounded-2xl p-6" style={{ background: 'var(--surface-secondary)' }}>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: 'var(--text-secondary)' }}>Référence</span>
                  <span style={{ color: 'var(--text-primary)' }} className="font-mono font-semibold">LST-{createdListingId || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: 'var(--text-secondary)' }}>Prix de vente</span>
                  <span style={{ color: 'var(--text-primary)' }} className="font-semibold">{formatCurrency(displayPrice)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: 'var(--text-secondary)' }}>Statut</span>
                  <span
                    className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                    style={{ background: 'var(--success-light)', color: 'var(--success)' }}
                  >
                    Active
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link to="/my-listings">
                <Button variant="outline" className="w-full sm:w-auto">Voir mes annonces</Button>
              </Link>
              <Link to="/market">
                <Button className="w-full sm:w-auto">
                  Voir le marché secondaire
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
