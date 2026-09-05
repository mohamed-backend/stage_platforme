import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EmptyState, ErrorMessage } from '@/components/common/States'

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(<EmptyState title="Nothing here" description="Try again" />)
    expect(screen.getByText('Nothing here')).toBeInTheDocument()
    expect(screen.getByText('Try again')).toBeInTheDocument()
  })

  it('renders action when provided', () => {
    render(
      <EmptyState
        title="T"
        description="D"
        action={<button>Retry</button>}
      />
    )
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
  })
})

describe('ErrorMessage', () => {
  it('renders default message and retry button when onRetry provided', async () => {
    let clicked = false
    render(<ErrorMessage onRetry={() => { clicked = true }} />)
    expect(screen.getByText(/une erreur/i)).toBeInTheDocument()
    const btn = screen.getByRole('button', { name: /réessayer/i })
    btn.click()
    expect(clicked).toBe(true)
  })

  it('renders custom message when provided', () => {
    render(<ErrorMessage message="Boom" />)
    expect(screen.getByText('Boom')).toBeInTheDocument()
  })
})