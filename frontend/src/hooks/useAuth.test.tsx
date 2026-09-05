import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

import { useKyc } from '@/hooks/useAuth'
import { authApi } from '@/api'

vi.mock('@/store', () => ({
  useAuthStore: () => ({ isAuthenticated: true }),
}))

vi.mock('@/api', () => ({
  authApi: {
    getKyc: vi.fn(),
  },
}))

function makeWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
}

describe('useKyc', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns KYC data on success', async () => {
    const payload = { id: 1, status: 'APPROVED', id_document: 'doc.pdf' }
    ;(authApi.getKyc as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: payload,
    })

    const { result } = renderHook(() => useKyc(), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(payload)
  })

  it('returns null on 404 (no KYC submitted)', async () => {
    const err = { response: { status: 404 } }
    ;(authApi.getKyc as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(err)

    const { result } = renderHook(() => useKyc(), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBeNull()
  })

  it('throws on non-404 errors', async () => {
    const err = { response: { status: 500 } }
    ;(authApi.getKyc as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(err)

    const { result } = renderHook(() => useKyc(), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})