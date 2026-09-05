import { cn } from '@/utils'
import { Check } from 'lucide-react'

interface Step {
  label: string
  description?: string
}

interface StepperProps {
  steps: Step[]
  currentStep: number
  className?: string
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <div className={cn('flex items-center w-full', className)}>
      {steps.map((step, index) => {
        const stepNumber = index + 1
        const isCompleted = stepNumber < currentStep
        const isCurrent = stepNumber === currentStep
        const isLast = index === steps.length - 1

        return (
          <div key={step.label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5 min-w-0">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 shrink-0',
                  isCompleted
                    ? 'bg-[var(--success)] text-white shadow-xs'
                    : isCurrent
                      ? 'bg-[var(--accent)] text-white shadow-md shadow-[var(--accent)]/30 ring-4 ring-[var(--accent-light)]'
                      : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] border border-[var(--border-subtle)]'
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : stepNumber}
              </div>
              <span
                className={cn(
                  'text-[11px] font-semibold text-center hidden sm:block max-w-[90px] truncate',
                  isCurrent
                    ? 'text-[var(--accent)] font-bold'
                    : isCompleted
                      ? 'text-[var(--success)]'
                      : 'text-[var(--text-muted)]'
                )}
              >
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div className="flex-1 mx-2 sm:mx-3">
                <div
                  className={cn(
                    'h-0.5 rounded-full transition-colors duration-300',
                    isCompleted
                      ? 'bg-[var(--success)]'
                      : 'bg-[var(--border-subtle)]'
                  )}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
