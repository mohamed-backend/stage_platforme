import { forwardRef } from 'react'
import { cn } from '@/utils'
import { AlertCircle } from 'lucide-react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  required?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, leftIcon, rightIcon, required, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div className="form-group">
        {label && (
          <label htmlFor={inputId} className={cn('form-label', required && 'form-label-required')}>
            <span>{label}</span>
          </label>
        )}
        <div className="form-control-wrapper">
          {leftIcon && (
            <div className="input-icon-left">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            required={required}
            className={cn(
              'input-fintech',
              leftIcon && 'input-with-icon-left',
              rightIcon && 'input-with-icon-right',
              error && 'input-fintech-error',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="input-icon-right">
              {rightIcon}
            </div>
          )}
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

Input.displayName = 'Input'
export { Input }
