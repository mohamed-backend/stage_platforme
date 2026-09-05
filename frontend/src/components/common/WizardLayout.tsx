import { useRef, useCallback, type TouchEvent } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/components/common'
import { Stepper } from '@/components/common/Stepper'
import { cn } from '@/utils'

interface WizardStep {
  label: string
  description?: string
}

interface WizardLayoutProps {
  steps: WizardStep[]
  currentStep: number
  onStepChange: (step: number) => void
  onNext?: () => void
  onBack?: () => void
  children: React.ReactNode
  nextLabel?: string
  backLabel?: string
  nextDisabled?: boolean
  showNavigation?: boolean
  className?: string
}

const SWIPE_THRESHOLD = 50
const SWIPE_VELOCITY_THRESHOLD = 0.3

export function WizardLayout({
  steps,
  currentStep,
  onStepChange: _onStepChange,
  onNext,
  onBack,
  children,
  nextLabel = 'Continuer',
  backLabel = 'Retour',
  nextDisabled = false,
  showNavigation = true,
  className,
}: WizardLayoutProps) {
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const touchStartTime = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const isFirstStep = currentStep === 1
  const isLastStep = currentStep === steps.length

  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    touchStartTime.current = Date.now()
  }, [])

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current
    const deltaY = e.changedTouches[0].clientY - touchStartY.current
    const deltaTime = Date.now() - touchStartTime.current

    if (Math.abs(deltaX) > Math.abs(deltaY) && deltaTime < 300) {
      const velocity = Math.abs(deltaX) / deltaTime
      if (Math.abs(deltaX) > SWIPE_THRESHOLD || velocity > SWIPE_VELOCITY_THRESHOLD) {
        if (deltaX < 0 && !isLastStep && onNext) {
          onNext()
        } else if (deltaX > 0 && !isFirstStep && onBack) {
          onBack()
        }
      }
    }
  }, [isFirstStep, isLastStep, onNext, onBack])

  return (
    <div className={cn('space-y-6', className)}>
      <Stepper steps={steps} currentStep={currentStep} />

      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="min-h-[300px] touch-pan-y"
      >
        <div className="animate-fade-in">
          {children}
        </div>
      </div>

      {showNavigation && (
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-surface-100 dark:border-surface-800">
          {!isFirstStep ? (
            <Button
              type="button"
              variant="ghost"
              onClick={onBack}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">{backLabel}</span>
            </Button>
          ) : (
            <div />
          )}

          {!isLastStep && (
            <Button
              type="button"
              variant="primary"
              onClick={onNext}
              disabled={nextDisabled}
              className="gap-2"
            >
              <span className="hidden sm:inline">{nextLabel}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
