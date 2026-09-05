import { useState, useCallback } from 'react'
import { useLocation, useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useProject, useCreateInvestment, useCreatePayment, useConfirmPayment } from '@/hooks'
import { Card, Button, Skeleton, EmptyState, RiskBadge, WizardLayout, KycAlertBanner } from '@/components/common'
import { DashboardLayout } from '@/components/layout'
import { formatCurrency, formatPercent } from '@/utils'
import {
  ArrowLeft, ArrowRight, CheckCircle2, Shield,
  TrendingUp, AlertCircle, CreditCard, Wallet,
} from 'lucide-react'

const steps = [
  { label: 'Montant' },
  { label: 'Résumé' },
  { label: 'Confirmation' },
  { label: 'Paiement' },
  { label: 'Terminé' },
]

export default function NewInvestmentPage() {
  const location = useLocation()
  const _navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const projectId = searchParams.get('project')
  const initialAmount = Number(searchParams.get('amount')) || 100

  const { data, isLoading } = useProject(projectId ?? undefined)
  const project = data

  if (!projectId) {
    return (
      <DashboardLayout currentPath={location.pathname}>
        <EmptyState
          title="No project selected"
          description="Please select a project to invest in."
          action={<Link to="/projects"><Button>Browse projects</Button></Link>}
        />
      </DashboardLayout>
    )
  }

  const [step, setStep] = useState(1)
  const [amount, setAmount] = useState(initialAmount)
  const [amountError, setAmountError] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank'>('card')
  const [investmentId, setInvestmentId] = useState<number | null>(null)
  const [paymentId, setPaymentId] = useState<number | null>(null)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const createInvestment = useCreateInvestment()
  const createPayment = useCreatePayment()
  const confirmPayment = useConfirmPayment()

  const effectiveAmount = project ? Math.max(amount, project.minimum_investment) : amount

  const validateAmount = (value: number) => {
    if (value <= 0) {
      setAmountError('Le montant doit être supérieur à 0')
    } else if (project && value < project.minimum_investment) {
      setAmountError(`Le montant minimum est de ${formatCurrency(project.minimum_investment)}`)
    } else {
      setAmountError('')
    }
  }

  const handleAmountChange = (value: number) => {
    setAmount(value)
    validateAmount(value)
  }

  const handleInvest = useCallback(async () => {
    const poolId = (project as any)?.pool?.id || (project as any)?.pool_id
    if (!poolId) return
    try {
      const result = await createInvestment.mutateAsync({
        pool: poolId,
        amount: effectiveAmount,
      })
      const newInvId = result.data.id
      setInvestmentId(newInvId)

      const payRes = await createPayment.mutateAsync({
        investment_id: newInvId,
        method: paymentMethod === 'card' ? 'CARD' : 'BANK_TRANSFER',
      })
      setPaymentId(payRes.data.id)
      setStep(4)
    } catch {
      setPaymentError("Échec de la création de l'investissement")
    }
  }, [project, effectiveAmount, paymentMethod, createInvestment, createPayment])

  const handleNext = useCallback(() => {
    if (step === 1) {
      if (amount <= 0 || (project && amount < project.minimum_investment)) return
      setStep(2)
    } else if (step === 2) {
      setStep(3)
    } else if (step === 3) {
      handleInvest()
    } else if (step === 4 && paymentId) {
      confirmPayment.mutate(paymentId, {
        onSuccess: () => setStep(5),
        onError: () => setPaymentError('Échec de la confirmation du paiement'),
      })
    }
  }, [step, amount, project, handleInvest, paymentId, confirmPayment])

  const handleBack = useCallback(() => {
    if (step === 2) setStep(1)
    else if (step === 3) setStep(2)
    else if (step === 4) setStep(3)
  }, [step])

  const isNextDisabled =
    (step === 1 && (amount <= 0 || (project && amount < project.minimum_investment))) ||
    (step === 3 && (createInvestment.isPending || createPayment.isPending)) ||
    (step === 4 && confirmPayment.isPending)

  const nextLabel = step === 3
    ? `Investir ${formatCurrency(amount)}`
    : step === 4
      ? 'Confirmer le paiement'
      : 'Continuer'

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

  if (!project) {
    return (
      <DashboardLayout currentPath={location.pathname}>
        <EmptyState
          title="Opportunité introuvable"
          action={<Link to="/projects"><Button>Retour</Button></Link>}
        />
      </DashboardLayout>
    )
  }

  const estimatedReturn = (amount * project.expected_return) / 100
  const totalReturn = amount + estimatedReturn


  return (
    <DashboardLayout currentPath={location.pathname}>
      <div className="mx-auto max-w-3xl space-y-6">
        <KycAlertBanner />

        <Link to={`/projects/${project.id}`} className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)]">
          <ArrowLeft className="h-4 w-4" />
          Retour à l'opportunité
        </Link>

        <WizardLayout
          steps={steps}
          currentStep={step}
          onStepChange={setStep}
          onNext={handleNext}
          onBack={handleBack}
          nextLabel={nextLabel}
          nextDisabled={isNextDisabled}
          showNavigation={step < 5}
        >
          {/* Step 1 — Choose amount */}
          {step === 1 && (
            <Card>
              <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                Choisissez votre montant
              </h1>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Vous investissez dans <span className="font-semibold text-[var(--text-primary)]">{project.title}</span>
              </p>

              <div className="mt-6">
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Montant de l'investissement
                </label>
                <div className="relative mt-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={project.minimum_investment}
                      max={project.minimum_investment * 100}
                      step={100}
                      value={amount}
                      onChange={(e) => handleAmountChange(Number(e.target.value))}
                      className="flex-1"
                    />
                    <input
                      type="number"
                      value={amount}
                      min={project.minimum_investment}
                      onChange={(e) => handleAmountChange(Number(e.target.value))}
                      className="h-14 w-32 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] pl-4 pr-12 text-2xl font-bold text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
                    />
                    <span className="text-base font-semibold text-[var(--text-muted)]">€</span>
                  </div>
                </div>
                {amountError ? (
                  <p className="mt-2 text-xs text-[var(--error)]">{amountError}</p>
                ) : (
                  <p className="mt-2 text-xs text-[var(--text-muted)]">
                    Investissement minimum : {formatCurrency(project.minimum_investment)}
                  </p>
                )}
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                {[100, 500, 1000, 2500, 5000, 10000].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => handleAmountChange(Math.max(project.minimum_investment, preset))}
                    className="h-11 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-primary)] text-sm font-semibold text-[var(--text-primary)] transition-colors hover:border-[var(--accent-muted)] hover:bg-[var(--accent-light)]"
                  >
                    {formatCurrency(preset)}
                  </button>
                ))}
              </div>

              <div className="mt-6 rounded-xl bg-[var(--accent-light)] p-4">
                <div className="flex items-start gap-3">
                  <TrendingUp className="mt-0.5 h-5 w-5 text-[var(--accent)]" />
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">Estimation du rendement</p>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                      Sur la base d'un rendement annuel de {formatPercent(project.expected_return)} et d'une durée de {project.duration_months} mois.
                    </p>
                    <p className="mt-2 text-2xl font-bold text-[var(--success)]">
                      +{formatCurrency(estimatedReturn)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Step 2 — Summary */}
          {step === 2 && (
            <Card>
              <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Vérifiez votre investissement</h1>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Vérifiez les informations avant de continuer.
              </p>

              <div className="mt-6 rounded-2xl bg-[var(--bg-secondary)] p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">{project.title}</h3>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">{project.category}</p>
                  </div>
                  <RiskBadge level={project.risk_level} />
                </div>
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                    <span className="text-sm text-[var(--text-secondary)]">Montant investi</span>
                    <span className="text-lg font-bold text-[var(--text-primary)]">{formatCurrency(amount)}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                    <span className="text-sm text-[var(--text-secondary)]">Rendement annuel estimé</span>
                    <span className="text-sm font-semibold text-[var(--success)]">+{formatPercent(project.expected_return)}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                    <span className="text-sm text-[var(--text-secondary)]">Durée</span>
                    <span className="text-sm font-semibold text-[var(--text-primary)]">{project.duration_months} mois</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                    <span className="text-sm text-[var(--text-secondary)]">Niveau de risque</span>
                    <RiskBadge level={project.risk_level} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[var(--text-primary)]">Estimation totale</span>
                    <span className="text-xl font-bold text-[var(--success)]">{formatCurrency(totalReturn)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-start gap-3 rounded-xl border border-[var(--warning-light)] bg-[var(--warning-light)] p-4">
                <AlertCircle className="mt-0.5 h-5 w-5 text-[var(--warning)]" />
                <p className="text-sm text-[var(--warning)]">
                  Vérifiez votre investissement avant de continuer. Tout investissement comporte un risque de perte en capital.
                </p>
              </div>
            </Card>
          )}

          {/* Step 3 — Confirmation */}
          {step === 3 && (
            <Card>
              <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Confirmation</h1>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Choisissez votre méthode de paiement et finalisez votre investissement.
              </p>

              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Méthode de paiement</p>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                      paymentMethod === 'card'
                        ? 'border-[var(--accent)] bg-[var(--accent-light)]'
                        : 'border-[var(--border-subtle)] bg-[var(--surface-primary)] hover:border-[var(--border-default)]'
                    }`}
                  >
                    <CreditCard className={`h-5 w-5 shrink-0 ${paymentMethod === 'card' ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`} />
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">Carte bancaire</p>
                      <p className="text-xs text-[var(--text-secondary)]">Visa, Mastercard, CB</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('bank')}
                    className={`flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                      paymentMethod === 'bank'
                        ? 'border-[var(--accent)] bg-[var(--accent-light)]'
                        : 'border-[var(--border-subtle)] bg-[var(--surface-primary)] hover:border-[var(--border-default)]'
                    }`}
                  >
                    <Wallet className={`h-5 w-5 shrink-0 ${paymentMethod === 'bank' ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`} />
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">Virement bancaire</p>
                      <p className="text-xs text-[var(--text-secondary)]">Sous 1 à 2 jours ouvrés</p>
                    </div>
                  </button>
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-[var(--bg-secondary)] p-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-secondary)]">Total à investir</span>
                  <span className="text-2xl font-bold text-[var(--text-primary)]">{formatCurrency(amount)}</span>
                </div>
              </div>

              <div className="mt-6 flex items-start gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4">
                <Shield className="mt-0.5 h-5 w-5 text-[var(--accent)]" />
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">Investissement sécurisé</p>
                  <p className="mt-1 text-xs text-[var(--text-secondary)]">
                    Vos données sont chiffrées et votre transaction est protégée.
                  </p>
                </div>
              </div>

              {createInvestment.isError && (
                <div className="mt-4 flex items-start gap-3 rounded-xl border border-[var(--error-light)] bg-[var(--error-light)] p-4">
                  <AlertCircle className="mt-0.5 h-5 w-5 text-[var(--error)]" />
                  <p className="text-sm text-[var(--error)]">
                    Une erreur est survenue lors de la création de l'investissement. Veuillez réessayer.
                  </p>
                </div>
              )}
            </Card>
          )}

          {/* Step 4 — Confirm payment */}
          {step === 4 && (
            <Card>
              <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Confirmer le paiement</h1>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Finalisez votre investissement en confirmant le paiement.
              </p>

              <div className="mt-6 rounded-2xl bg-[var(--bg-secondary)] p-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-light)]">
                    <CreditCard className="h-6 w-6 text-[var(--accent)]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      Paiement par {paymentMethod === 'card' ? 'carte bancaire' : 'virement bancaire'}
                    </p>
                    <p className="mt-1 text-xs text-[var(--text-secondary)]">
                      Référence : {paymentId ? `PAY-${paymentId.toString().padStart(8, '0')}` : '—'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[var(--text-secondary)]">Montant</p>
                    <p className="text-lg font-bold text-[var(--text-primary)]">{formatCurrency(amount)}</p>
                  </div>
                </div>
              </div>

              {paymentError && (
                <div className="mt-4 flex items-start gap-3 rounded-xl border border-[var(--error-light)] bg-[var(--error-light)] p-4">
                  <AlertCircle className="mt-0.5 h-5 w-5 text-[var(--error)]" />
                  <p className="text-sm text-[var(--error)]">{paymentError}</p>
                </div>
              )}

              <div className="mt-6 flex items-start gap-3 rounded-xl border border-[var(--warning-light)] bg-[var(--warning-light)] p-4">
                <AlertCircle className="mt-0.5 h-5 w-5 text-[var(--warning)]" />
                <p className="text-sm text-[var(--warning)]">
                  En mode démo, la confirmation simule un paiement réussi. En production, vous seriez redirigé vers votre banque ou processeur de paiement.
                </p>
              </div>
            </Card>
          )}
        </WizardLayout>

        {/* Step 5 — Final success */}
        {step === 5 && (
          <Card>
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--success-light)]">
                <CheckCircle2 className="h-8 w-8 text-[var(--success)]" />
              </div>
              <h1 className="mt-6 text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                Investissement confirmé
              </h1>
              <p className="mt-3 text-sm text-[var(--text-secondary)]">
                Votre investissement de <span className="font-semibold text-[var(--text-primary)]">{formatCurrency(amount)}</span> dans <span className="font-semibold text-[var(--text-primary)]">{project.title}</span> a été pris en compte.
              </p>
            </div>

            <div className="mt-8 rounded-2xl bg-[var(--bg-secondary)] p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Référence</span>
                  <span className="font-mono font-semibold text-[var(--text-primary)]">
                    {investmentId ? `INV-${investmentId.toString().padStart(6, '0')}` : 'INV-2025-0000'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Montant</span>
                  <span className="font-semibold text-[var(--text-primary)]">{formatCurrency(amount)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Statut</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--success-light)] px-2.5 py-0.5 text-xs font-semibold text-[var(--success)]">
                    <CheckCircle2 className="h-3 w-3" />
                    Confirmé
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link to="/investments">
                <Button variant="outline" className="w-full sm:w-auto">Voir mes investissements</Button>
              </Link>
              <Link to="/projects">
                <Button variant="primary" className="w-full sm:w-auto">
                  Découvrir d'autres opportunités
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
