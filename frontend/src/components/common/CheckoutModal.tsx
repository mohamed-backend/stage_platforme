import { useState, useCallback, useEffect } from 'react'
import { cn } from '@/utils'
import { X, ChevronLeft, ChevronRight, Check, Upload, Copy, CheckCheck, Building2 } from 'lucide-react'
import { KycAlertBanner } from './KycAlertBanner'

interface CheckoutStep {
  id: string
  label: string
  description?: string
}

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  steps: CheckoutStep[]
  initialStep?: number
  onStepChange?: (step: number) => void
  onComplete?: (data: Record<string, unknown>) => void
  children: React.ReactNode
  className?: string
}

function StepProgressBar({
  steps,
  currentStep,
}: {
  steps: CheckoutStep[]
  currentStep: number
}) {
  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <div className="px-5 pt-4 pb-2">
      {/* Linear progress bar */}
      <div className="h-1.5 w-full rounded-full bg-[var(--bg-tertiary)] mb-4 overflow-hidden">
        <div
          className="h-full rounded-full bg-[var(--accent)] transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step circles */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep
          return (
            <div key={step.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all duration-300',
                    isCompleted
                      ? 'bg-[var(--success)] text-white scale-90'
                      : isCurrent
                        ? 'bg-[var(--accent)] text-white shadow-sm shadow-[var(--accent)]/30 ring-4 ring-[var(--accent-light)] scale-105'
                        : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border-subtle)]'
                  )}
                >
                  {isCompleted ? <Check className="h-3.5 w-3.5" /> : index + 1}
                </div>
                <span className={cn(
                  'text-[10px] font-semibold mt-1.5 text-center max-w-[64px] leading-tight',
                  isCurrent ? 'text-[var(--accent)] font-bold' : isCompleted ? 'text-[var(--success)]' : 'text-[var(--text-muted)]'
                )}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={cn(
                  'flex-1 h-0.5 mx-1 mt-[-14px] rounded-full transition-colors duration-300',
                  index < currentStep ? 'bg-[var(--success)]' : 'bg-[var(--border-subtle)]'
                )} />
              )}
            </div>
          )
        })}
      </div>
      <div className="h-px bg-[var(--border-subtle)] mt-4" />
    </div>
  )
}

export function CheckoutModal({
  isOpen,
  onClose,
  steps,
  initialStep = 0,
  onStepChange,
  onComplete,
  children,
  className,
}: CheckoutModalProps) {
  const [currentStep, setCurrentStep] = useState(initialStep)

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(initialStep)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen, initialStep])

  const goToStep = useCallback(
    (step: number) => {
      setCurrentStep(step)
      onStepChange?.(step)
    },
    [onStepChange]
  )

  const goNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      goToStep(currentStep + 1)
    }
  }, [currentStep, steps.length, goToStep])

  const goPrev = useCallback(() => {
    if (currentStep > 0) {
      goToStep(currentStep - 1)
    }
  }, [currentStep, goToStep])

  const handleComplete = useCallback(() => {
    onComplete?.({})
    onClose()
  }, [onComplete, onClose])

  if (!isOpen) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className={cn('modal-dialog modal-dialog-lg', className)}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-header">
          <h2 className="modal-title">Finalisation de l'opération</h2>
          <button
            onClick={onClose}
            className="modal-close-btn"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <StepProgressBar steps={steps} currentStep={currentStep} />

        <div className="modal-body">
          <KycAlertBanner className="mb-4" compact />
          <div key={currentStep}>
            {children}
          </div>
        </div>

        <div className="modal-footer">
          {currentStep > 0 && (
            <button
              onClick={goPrev}
              className="btn btn-secondary btn-sm"
            >
              <ChevronLeft className="h-4 w-4" />
              Retour
            </button>
          )}
          <button
            onClick={currentStep === steps.length - 1 ? handleComplete : goNext}
            className="btn btn-primary btn-sm"
          >
            {currentStep === steps.length - 1 ? (
              <>
                <Check className="h-4 w-4" />
                Confirmer
              </>
            ) : (
              <>
                Suivant
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export interface CheckoutStepProps {
  title?: string
  children: React.ReactNode
  className?: string
}

export function CheckoutStep({ title, children, className }: CheckoutStepProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {title && (
        <h3 className="text-base font-bold text-[var(--text-primary)]">{title}</h3>
      )}
      {children}
    </div>
  )
}

export function RIBCopySection() {
  const [copied, setCopied] = useState(false)
  const rib = 'FR76 3000 4000 0100 2345 6789 012'

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(rib.replace(/\s/g, '')).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [rib])

  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent-light)] text-[var(--accent)] shrink-0">
          <Building2 className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold text-[var(--text-primary)]">Coordonnées Bancaires Séquestre</p>
          <p className="text-xs text-[var(--text-muted)]">Compte séquestre agréé AMF</p>
        </div>
      </div>
      <div className="flex items-center justify-between rounded-lg bg-[var(--surface-primary)] border border-[var(--border-subtle)] p-3">
        <span className="font-mono text-sm font-bold text-[var(--text-primary)] tracking-wider">
          {rib}
        </span>
        <button
          onClick={handleCopy}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg transition-all',
            copied
              ? 'bg-[var(--success-light)] text-[var(--success)]'
              : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          )}
          aria-label="Copier le RIB"
        >
          {copied ? <CheckCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
      <p className="text-xs text-[var(--text-muted)] mt-2">
        Effectuez le virement en indiquant la référence de l'investissement dans le motif.
      </p>
    </div>
  )
}

export function ReceiptUpload({ onUpload }: { onUpload?: (file: File) => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0]
      if (selected) {
        setFile(selected)
        if (selected.type.startsWith('image/')) {
          const reader = new FileReader()
          reader.onload = (ev) => setPreview(ev.target?.result as string)
          reader.readAsDataURL(selected)
        } else {
          setPreview(null)
        }
        onUpload?.(selected)
      }
    },
    [onUpload]
  )

  const handleRemove = useCallback(() => {
    setFile(null)
    setPreview(null)
  }, [])

  return (
    <div className="space-y-2">
      <label className="form-label">
        <span>Justificatif de virement (optionnel)</span>
      </label>
      {file ? (
        <div className="relative rounded-xl border border-[var(--accent-muted)] bg-[var(--accent-light)] p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent)] text-white shrink-0">
              <Upload className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[var(--text-primary)] truncate">{file.name}</p>
              <p className="text-[10px] text-[var(--text-muted)]">
                {(file.size / 1024 / 1024).toFixed(2)} Mo
              </p>
            </div>
          </div>
          <button
            onClick={handleRemove}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
            aria-label="Supprimer le fichier"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label
          className={cn(
            'flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-all duration-200 cursor-pointer',
            'border-[var(--border-default)] bg-[var(--surface-secondary)] hover:border-[var(--accent)]'
          )}
        >
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={handleChange}
            className="sr-only"
          />
          <div className="flex flex-col items-center text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--surface-primary)] text-[var(--text-muted)] mb-2 shadow-xs">
              <Upload className="h-5 w-5" />
            </div>
            <p className="text-xs font-semibold text-[var(--text-primary)]">
              Cliquez pour déposer un justificatif
            </p>
            <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
              PDF, PNG ou JPG (max 5 Mo)
            </p>
          </div>
        </label>
      )}
    </div>
  )
}

export function PhoneInput({
  value,
  onChange,
  error,
}: {
  value: string
  onChange: (value: string) => void
  error?: string
}) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value
      onChange(input)
    },
    [onChange]
  )

  return (
    <div className="form-group">
      <label className="form-label">
        <span>Numéro de téléphone</span>
      </label>
      <input
        type="tel"
        value={value}
        onChange={handleChange}
        placeholder="+33 6 12 34 56 78"
        className={cn('input-fintech', error && 'input-fintech-error')}
      />
      {error && (
        <p className="form-error">{error}</p>
      )}
    </div>
  )
}
