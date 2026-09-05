import api from './axios'
import type { PaginatedResponse, Investment } from '@/types'

export const investmentsApi = {
  getMine: (params?: Record<string, string | number>, signal?: AbortSignal) =>
    api.get<PaginatedResponse<Investment>>('/investments/mine/', { params, signal }),

  getById: (id: number, signal?: AbortSignal) =>
    api.get<Investment>(`/investments/${id}/`, { signal }),

  create: (data: { pool: number; amount: number }, signal?: AbortSignal) =>
    api.post<Investment>('/investments/', data, { signal }),

  getOwnerInvestments: (params?: Record<string, string | number>, signal?: AbortSignal) =>
    api.get<PaginatedResponse<Investment>>('/investments/owner/', { params, signal }),
}
