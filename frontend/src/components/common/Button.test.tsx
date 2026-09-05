import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/common/Button'

describe('Button', () => {
  it('renders children and respects type', () => {
    render(<Button type="submit">Click me</Button>)
    const btn = screen.getByRole('button', { name: /click me/i })
    expect(btn).toBeInTheDocument()
    expect(btn).toHaveAttribute('type', 'submit')
  })

  it('shows loading spinner and disables when loading', () => {
    render(<Button loading>Save</Button>)
    const btn = screen.getByRole('button', { name: /save/i })
    expect(btn).toBeDisabled()
    expect(btn.querySelector('svg')).toBeInTheDocument()
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Cancel</Button>)
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled()
  })

  it('applies size and variant classes', () => {
    render(<Button size="xl" variant="danger">X</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('btn-xl')
    expect(btn.className).toContain('btn-danger')
  })
})