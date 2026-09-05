import { forwardRef } from 'react'
import { cn } from '@/utils'
import { AlertCircle } from 'lucide-react'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helperText?: string
  options: Array<{ value: string | number; label: string }>
  placeholder?: string
  required?: boolean
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, options, placeholder, id, required, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div className="form-group">
        {label && (
          <label htmlFor={selectId} className={cn('form-label', required && 'form-label-required')}>
            <span>{label}</span>
          </label>
        )}
        <div className="form-control-wrapper">
          <select
            ref={ref}
            id={selectId}
            required={required}
            className={cn(
              'select-fintech',
              error && 'input-fintech-error',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled className="bg-[var(--surface-primary)] text-[var(--text-muted)]">
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-[var(--surface-primary)] text-[var(--text-primary)]">
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        {error && (
          <p className="form-error">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{error}</span>
          </p>
        )}
        {helperText && !error && <p className="form-hint">{helperText}</p>}
      </div>
    )
  }
)

Select.displayName = 'Select'
export { Select }
