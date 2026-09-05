import { describe, it, expect } from 'vitest'
import {
  cn as cnUtil,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatPercent,
  getProgressPercent,
  formatCompactNumber,
} from '@/utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cnUtil('foo', 'bar')).toBe('foo bar')
  })

  it('drops falsy values', () => {
    expect(cnUtil('foo', false, null, undefined, 'bar')).toBe('foo bar')
  })

  it('concatenates multiple classes', () => {
    expect(cnUtil('p-2', 'p-4')).toBe('p-2 p-4')
  })

})

describe('formatCurrency', () => {
  it('formats a positive number as EUR', () => {
    const out = formatCurrency(1234.5)
    expect(out).toContain('1')
    expect(out).toMatch(/€|EUR|u20AC/)
  })

  it('formats zero', () => {
    expect(formatCurrency(0)).toBeTruthy()
  })
})

describe('formatDate', () => {
  it('formats an ISO date in fr-FR', () => {
    const out = formatDate('2025-01-15T00:00:00Z')
    expect(out).toMatch(/2025/)
    expect(out).toContain('15')
  })
})

describe('formatDateTime', () => {
  it('includes year and day', () => {
    const out = formatDateTime('2025-06-10T15:30:00Z')
    expect(out).toMatch(/2025/)
  })
})

describe('formatPercent', () => {
  it('renders with one decimal', () => {
    expect(formatPercent(10)).toBe('10.0%')
    expect(formatPercent(0)).toBe('0.0%')
    expect(formatPercent(99.95)).toBe('100.0%')
  })
})

describe('getProgressPercent', () => {
  it('returns ratio when under target', () => {
    expect(getProgressPercent(25, 100)).toBe(25)
  })

  it('caps at 100 when over target', () => {
    expect(getProgressPercent(150, 100)).toBe(100)
  })

  it('returns 0 when target is 0', () => {
    expect(getProgressPercent(10, 0)).toBe(0)
  })

  it('returns 0 when collected is 0', () => {
    expect(getProgressPercent(0, 100)).toBe(0)
  })
})

describe('formatCompactNumber', () => {
  it('returns plain number under 1000', () => {
    expect(formatCompactNumber(0)).toBe('0')
    expect(formatCompactNumber(42)).toBe('42')
    expect(formatCompactNumber(999)).toBe('999')
  })

  it('returns k-suffixed number for thousands', () => {
    expect(formatCompactNumber(1000)).toBe('1 k')
    expect(formatCompactNumber(1500)).toBe('1.5 k')
    expect(formatCompactNumber(12000)).toBe('12 k')
  })

  it('returns M€-suffixed number for millions', () => {
    expect(formatCompactNumber(1_000_000, '€')).toBe('1 M€')
    expect(formatCompactNumber(2_500_000, '€')).toBe('2.5 M€')
    expect(formatCompactNumber(45_000_000, '€')).toBe('45 M€')
  })
})