import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { LoadingSpinner, PageLoader, Skeleton } from '@/components/common/LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renders an SVG with animate-spin class', () => {
    const { container } = render(<LoadingSpinner />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg?.className.baseVal || svg?.getAttribute('class') || '').toContain('animate-spin')
  })
})

describe('PageLoader', () => {
  it('renders a centered spinner', () => {
    const { container } = render(<PageLoader />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })
})

describe('Skeleton', () => {
  it('renders with animate-pulse class', () => {
    const { container } = render(<Skeleton className="h-4 w-20" />)
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain('animate-pulse')
    expect(el.className).toContain('h-4')
  })
})