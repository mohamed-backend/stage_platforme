import { useState, useEffect, useRef, useCallback } from 'react'
import { cn } from '@/utils'
import { X, ChevronDown, ChevronUp, Check, GripHorizontal } from 'lucide-react'

interface ProductOption {
  id: string
  label: string
  value: string
  icon?: React.ReactNode
  color?: string
}

interface ProductDimension {
  id: string
  label: string
  min: number
  max: number
  step: number
  unit: string
  value: number
}

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  preview?: React.ReactNode
  options?: ProductOption[]
  dimensions?: ProductDimension[]
  onOptionsChange?: (options: Record<string, string>) => void
  onDimensionsChange?: (dimensions: Record<string, number>) => void
  onConfirm?: (config: { options: Record<string, string>; dimensions: Record<string, number> }) => void
  confirmLabel?: string
  className?: string
}

function DimensionStepper({
  dimension,
  onChange,
}: {
  dimension: ProductDimension
  onChange: (id: string, value: number) => void
}) {
  const canDecrement = dimension.value > dimension.min
  const canIncrement = dimension.value < dimension.max

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--text-primary)]">
          {dimension.label}
        </p>
        <p className="text-xs text-[var(--text-muted)]">
          {dimension.min}{dimension.unit} — {dimension.max}{dimension.unit}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => canDecrement && onChange(dimension.id, dimension.value - dimension.step)}
          disabled={!canDecrement}
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-150',
            'active:scale-95',
            canDecrement
              ? 'border-[var(--border-subtle)] bg-[var(--surface-primary)] text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] hover:border-[var(--border-default)]'
              : 'border-[var(--border-subtle)] bg-[var(--surface-secondary)] text-[var(--text-muted)] opacity-50 cursor-not-allowed'
          )}
          aria-label={`Diminuer ${dimension.label}`}
        >
          <span className="text-lg font-bold leading-none">-</span>
        </button>
        <span className="min-w-[3.5rem] text-center text-sm font-bold text-[var(--text-primary)] tabular-nums">
          {dimension.value}{dimension.unit}
        </span>
        <button
          onClick={() => canIncrement && onChange(dimension.id, dimension.value + dimension.step)}
          disabled={!canIncrement}
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-150',
            'active:scale-95',
            canIncrement
              ? 'border-[var(--border-subtle)] bg-[var(--surface-primary)] text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] hover:border-[var(--border-default)]'
              : 'border-[var(--border-subtle)] bg-[var(--surface-secondary)] text-[var(--text-muted)] opacity-50 cursor-not-allowed'
          )}
          aria-label={`Augmenter ${dimension.label}`}
        >
          <span className="text-lg font-bold leading-none">+</span>
        </button>
      </div>
    </div>
  )
}

function OptionSwatch({
  option,
  isSelected,
  onClick,
}: {
  option: ProductOption
  isSelected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex h-11 min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-xl border-2 px-3.5 transition-all duration-150 font-medium text-sm',
        'active:scale-95',
        isSelected
          ? 'border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)]'
          : 'border-[var(--border-subtle)] bg-[var(--surface-primary)] text-[var(--text-secondary)] hover:border-[var(--border-default)] hover:bg-[var(--surface-secondary)]'
      )}
      aria-pressed={isSelected}
    >
      {option.color && (
        <span
          className="h-4 w-4 rounded-full border border-[var(--border-subtle)] shrink-0"
          style={{ backgroundColor: option.color }}
        />
      )}
      {option.icon && <span className="flex items-center shrink-0">{option.icon}</span>}
      <span>{option.label}</span>
      {isSelected && (
        <Check className="h-4 w-4 text-[var(--accent)] shrink-0" />
      )}
    </button>
  )
}

export function ProductModal({
  isOpen,
  onClose,
  title,
  subtitle,
  preview,
  options = [],
  dimensions = [],
  onOptionsChange,
  onDimensionsChange,
  onConfirm,
  confirmLabel = 'Confirmer',
  className,
}: ProductModalProps) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [dimensionValues, setDimensionValues] = useState<Record<string, number>>({})
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const sheetRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)
  const currentY = useRef(0)

  useEffect(() => {
    if (isOpen) {
      const initialOptions: Record<string, string> = {}
      options.forEach((opt) => {
        if (!selectedOptions[opt.id]) initialOptions[opt.id] = opt.value
      })
      if (Object.keys(initialOptions).length > 0) {
        setSelectedOptions((prev) => ({ ...prev, ...initialOptions }))
      }

      const initialDimensions: Record<string, number> = {}
      dimensions.forEach((dim) => {
        initialDimensions[dim.id] = dim.value
      })
      if (Object.keys(initialDimensions).length > 0) {
        setDimensionValues((prev) => ({ ...prev, ...initialDimensions }))
      }
      setDragOffset(0)
      setIsExpanded(false)
    }
  }, [isOpen, options, dimensions])

  const handleOptionSelect = useCallback(
    (optionId: string, value: string) => {
      setSelectedOptions((prev) => {
        const next = { ...prev, [optionId]: value }
        onOptionsChange?.(next)
        return next
      })
    },
    [onOptionsChange]
  )

  const handleDimensionChange = useCallback(
    (dimensionId: string, value: number) => {
      setDimensionValues((prev) => {
        const next = { ...prev, [dimensionId]: value }
        onDimensionsChange?.(next)
        return next
      })
    },
    [onDimensionsChange]
  )

  const handleConfirm = useCallback(() => {
    onConfirm?.({ options: selectedOptions, dimensions: dimensionValues })
    onClose()
  }, [onConfirm, selectedOptions, dimensionValues, onClose])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY
    currentY.current = e.touches[0].clientY
    setIsDragging(true)
  }, [])

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging) return
      currentY.current = e.touches[0].clientY
      const diff = currentY.current - startY.current
      if (diff > 0) {
        setDragOffset(Math.min(diff, 300))
      }
    },
    [isDragging]
  )

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return
    setIsDragging(false)
    const diff = currentY.current - startY.current
    if (diff > 120) {
      onClose()
    } else {
      setDragOffset(0)
    }
  }, [isDragging, onClose])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Desktop: centered modal */}
      <div className="hidden lg:flex fixed inset-0 z-50 items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />
        <div
          className={cn(
            'relative bg-[var(--surface-elevated)] rounded-2xl border border-[var(--border-subtle)] shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col transform transition-all',
            className
          )}
        >
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[var(--border-subtle)] shrink-0">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-[var(--text-primary)] truncate">{title}</h2>
              {subtitle && (
                <p className="text-xs text-[var(--text-secondary)] truncate mt-0.5">{subtitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] transition-colors ml-2"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {preview && (
              <div className="p-4 border-b border-[var(--border-subtle)]">
                {preview}
              </div>
            )}

            <div className="p-4 sm:p-6 space-y-4">
              {options.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
                    Options
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {options.map((option) => (
                      <OptionSwatch
                        key={option.id}
                        option={option}
                        isSelected={selectedOptions[option.id] === option.value}
                        onClick={() => handleOptionSelect(option.id, option.value)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {dimensions.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
                    Dimensions
                  </h3>
                  <div className="divide-y divide-[var(--border-subtle)]">
                    {dimensions.map((dim) => (
                      <DimensionStepper
                        key={dim.id}
                        dimension={{ ...dim, value: dimensionValues[dim.id] ?? dim.value }}
                        onChange={handleDimensionChange}
                      />
                    ))}
                  </div>
                </div>
              )}

              {options.length === 0 && dimensions.length === 0 && (
                <div className="text-center py-8 text-[var(--text-muted)]">
                  Aucune option de configuration disponible
                </div>
              )}
            </div>
          </div>

          {onConfirm && (
            <div className="border-t border-[var(--border-subtle)] p-4 sm:p-6 shrink-0">
              <button
                onClick={handleConfirm}
                className="btn btn-primary w-full h-12 text-sm font-semibold"
              >
                {confirmLabel}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile: bottom sheet */}
      <div className="fixed inset-0 z-50 lg:hidden">
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
          onClick={onClose}
          style={{ opacity: isDragging ? Math.max(0.3, 1 - dragOffset / 400) : 1 }}
        />
        <div
          ref={sheetRef}
          className={cn(
            'fixed bottom-0 left-0 right-0 bg-[var(--surface-elevated)] rounded-t-3xl shadow-2xl flex flex-col border-t border-[var(--border-subtle)]',
            'max-h-[90vh]',
            isExpanded ? 'h-[90vh]' : 'h-[75vh]',
            !isDragging && 'transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]'
          )}
          style={{
            transform: isDragging ? `translateY(${dragOffset}px)` : 'translateY(0)',
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Drag handle */}
          <div className="flex flex-col items-center pt-3 pb-1 shrink-0">
            <div className="flex items-center justify-center w-full cursor-grab active:cursor-grabbing">
              <GripHorizontal className="h-5 w-5 text-[var(--text-muted)]" />
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-1 flex items-center gap-1 text-xs text-[var(--text-muted)] min-h-[44px] min-w-[44px] justify-center"
              aria-label={isExpanded ? 'Réduire' : 'Agrandir'}
            >
              {isExpanded ? (
                <>
                  <ChevronDown className="h-4 w-4" />
                  <span>Réduire</span>
                </>
              ) : (
                <>
                  <ChevronUp className="h-4 w-4" />
                  <span>Agrandir</span>
                </>
              )}
            </button>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 pb-3 border-b border-[var(--border-subtle)] shrink-0">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-[var(--text-primary)] truncate">{title}</h2>
              {subtitle && (
                <p className="text-xs text-[var(--text-secondary)] truncate mt-0.5">{subtitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] transition-colors ml-2"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {preview && (
              <div className="sticky top-0 z-10 bg-[var(--surface-elevated)] border-b border-[var(--border-subtle)] p-4">
                {preview}
              </div>
            )}

            <div className="p-4 space-y-4">
              {options.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
                    Options
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {options.map((option) => (
                      <OptionSwatch
                        key={option.id}
                        option={option}
                        isSelected={selectedOptions[option.id] === option.value}
                        onClick={() => handleOptionSelect(option.id, option.value)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {dimensions.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
                    Dimensions
                  </h3>
                  <div className="divide-y divide-[var(--border-subtle)]">
                    {dimensions.map((dim) => (
                      <DimensionStepper
                        key={dim.id}
                        dimension={{ ...dim, value: dimensionValues[dim.id] ?? dim.value }}
                        onChange={handleDimensionChange}
                      />
                    ))}
                  </div>
                </div>
              )}

              {options.length === 0 && dimensions.length === 0 && (
                <div className="text-center py-8 text-[var(--text-muted)]">
                  Aucune option de configuration disponible
                </div>
              )}
            </div>
          </div>

          {/* Confirm button */}
          {onConfirm && (
            <div className="border-t border-[var(--border-subtle)] p-4 safe-area-pb shrink-0">
              <button
                onClick={handleConfirm}
                className="btn btn-primary w-full h-12 text-sm font-semibold"
              >
                {confirmLabel}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
