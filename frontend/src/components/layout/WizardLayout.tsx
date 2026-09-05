import React, { type ReactNode } from 'react';
import { Button } from '@/components/common';

interface WizardLayoutProps {
  steps: { label: string }[];
  currentStep: number;
  onStepChange?: (step: number) => void;
  onNext: () => void;
  onBack: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  showNavigation?: boolean;
  children: ReactNode;
}

export default function WizardLayout({
  steps,
  currentStep,
  onStepChange,
  onNext,
  onBack,
  nextLabel = 'Next',
  nextDisabled = false,
  showNavigation = true,
  children,
}: WizardLayoutProps) {
  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center gap-4">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className={`flex-1 py-2 text-center rounded-md ${idx + 1 === currentStep ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'}`}
            onClick={() => onStepChange && onStepChange(idx + 1)}
          >
            {step.label}
          </div>
        ))}
      </div>

      {/* Content */}
      <div>{children}</div>

      {/* Navigation */}
      {showNavigation && (
        <div className="flex justify-between mt-4">
          <Button variant="secondary" onClick={onBack} disabled={currentStep === 1}>
            Back
          </Button>
          <Button variant="accent" onClick={onNext} disabled={nextDisabled}>
            {nextLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
