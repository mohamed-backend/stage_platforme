import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from '@/components/common/Badge'

describe('Badge', () => {
  it('renders children text', () => {
    render(<Badge>Actif</Badge>)
    expect(screen.getByText('Actif')).toBeInTheDocument()
  })

  it('applies variant classes', () => {
    const { container } = render(<Badge variant="success">OK</Badge>)
    const badge = container.firstChild as HTMLElement
    expect(badge.className).toContain('badge-success')
  })

  it('defaults to default variant', () => {
    const { container } = render(<Badge>X</Badge>)
    const badge = container.firstChild as HTMLElement
    expect(badge.className).toContain('badge')
  })
})