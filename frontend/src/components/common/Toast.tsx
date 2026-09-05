import { useState, useEffect, useCallback, createContext, useContext, useRef } from 'react'
import { cn } from '@/utils'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

interface ToastContextValue {
  toasts: Toast[]
  addToast: (type: ToastType, message: string, duration?: number) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="h-5 w-5 text-success-500" />,
  error: <AlertCircle className="h-5 w-5 text-danger-500" />,
  warning: <AlertTriangle className="h-5 w-5 text-warning-500" />,
  info: <Info className="h-5 w-5 text-accent-500" />,
}

const styles: Record<ToastType, string> = {
  success: 'border-success-200 bg-success-50 dark:border-success-500/30 dark:bg-success-500/10',
  error: 'border-danger-200 bg-danger-50 dark:border-danger-500/30 dark:bg-danger-500/10',
  warning: 'border-warning-200 bg-warning-50 dark:border-warning-500/30 dark:bg-warning-500/10',
  info: 'border-accent-200 bg-accent-50 dark:border-accent-500/30 dark:bg-accent-500/10',
}

let toastCounter = 0

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true))

    const duration = toast.duration ?? 4000
    if (duration > 0) {
      timerRef.current = setTimeout(() => {
        setIsExiting(true)
        setTimeout(() => onRemove(toast.id), 300)
      }, duration)
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [toast.id, toast.duration, onRemove])

  const handleClose = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsExiting(true)
    setTimeout(() => onRemove(toast.id), 300)
  }, [toast.id, onRemove])

  return (
    <div
      className={cn(
        'pointer-events-auto w-full max-w-sm rounded-xl border p-4 shadow-lg backdrop-blur-lg transition-all duration-300',
        styles[toast.type],
        isVisible && !isExiting
          ? 'translate-y-0 opacity-100 scale-100'
          : 'translate-y-4 opacity-0 scale-95'
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <span className="shrink-0 mt-0.5">{icons[toast.type]}</span>
        <p className="flex-1 text-sm font-medium text-surface-900 dark:text-white">
          {toast.message}
        </p>
        <button
          onClick={handleClose}
          className="shrink-0 flex h-6 w-6 items-center justify-center rounded-lg text-surface-400 hover:text-surface-600 dark:hover:text-white hover:bg-surface-200/50 dark:hover:bg-surface-700/50 transition-colors"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback(
    (type: ToastType, message: string, duration?: number) => {
      const id = `toast-${++toastCounter}`
      setToasts((prev) => [...prev, { id, type, message, duration }])
    },
    []
  )

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div
        ref={containerRef}
        className="fixed top-4 right-4 left-4 sm:left-auto z-[100] flex flex-col items-end gap-2 pointer-events-none"
        aria-label="Notifications"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useCopyToClipboard() {
  const { addToast } = useToast()
  const [copied, setCopied] = useState(false)

  const copy = useCallback(
    async (text: string, label?: string) => {
      try {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        addToast('success', label ? `${label} copié !` : 'Copié dans le presse-papier !', 2000)
        setTimeout(() => setCopied(false), 2000)
      } catch {
        addToast('error', 'Impossible de copier. Veuillez réessayer.')
      }
    },
    [addToast]
  )

  return { copied, copy }
}
