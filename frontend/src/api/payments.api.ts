import api from './axios'
import type { PaginatedResponse, Payment } from '@/types'

export const paymentsApi = {
  getMine: (params?: Record<string, string | number>, signal?: AbortSignal) =>
    api.get<PaginatedResponse<Payment>>('/payments/mine/', { params, signal }),

  getById: (id: number, signal?: AbortSignal) =>
    api.get<Payment>(`/payments/${id}/`, { signal }),

  create: (data: { investment_id: number; method: string }, signal?: AbortSignal) =>
    api.post<Payment>('/payments/', data, { signal }),

  confirm: (id: number, signal?: AbortSignal) =>
    api.post<Payment>(`/payments/${id}/confirm/`, {}, { signal }),
}
