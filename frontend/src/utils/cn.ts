import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}


export function formatCurrency(amount: number, maxDecimals: number = 0): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '0 €'
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: maxDecimals,
  }).format(amount)
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatPercent(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return '—'
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '—'
  return `${num.toFixed(1)}%`
}

export function getProgressPercent(collected: number, target: number): number {
  if (!target || target <= 0 || isNaN(target) || isNaN(collected)) return 0
  const ratio = (collected / target) * 100
  return Math.min(Math.max(Math.round(ratio), 0), 100)
}

export function formatCompactNumber(n: number | null | undefined, unit: string = ''): string {
  if (n === null || n === undefined || isNaN(n)) return '0'
  if (n >= 1_000_000) {
    const val = (n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1).replace('.0', '')
    return unit ? `${val} M${unit}` : `${val} M`
  }
  if (n >= 1_000) {
    const val = (n / 1_000).toFixed(n >= 10_000 ? 0 : 1).replace('.0', '')
    return unit ? `${val} k${unit}` : `${val} k`
  }
  return unit ? `${n} ${unit}`.trim() : String(n)
}

export function formatApiError(error: any, defaultMsg = 'Requête invalide. Veuillez vérifier vos informations.'): string {
  if (!error) return defaultMsg
  const data = error.response?.data
  if (!data) {
    return error.message || defaultMsg
  }
  if (typeof data === 'string') return data
  if (typeof data === 'object') {
    if (data.detail && typeof data.detail === 'string') return data.detail
    if (data.non_field_errors && Array.isArray(data.non_field_errors)) return data.non_field_errors.join(' ')
    const parts: string[] = []
    for (const [key, val] of Object.entries(data)) {
      const msg = Array.isArray(val) ? val.join(' ') : String(val)
      if (key === 'detail' || key === 'non_field_errors') {
        parts.push(msg)
      } else {
        parts.push(`${key}: ${msg}`)
      }
    }
    if (parts.length > 0) return parts.join(' | ')
  }
  return defaultMsg
}
