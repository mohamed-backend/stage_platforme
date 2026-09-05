import api from './axios'
import type { PaginatedResponse, Transaction } from '@/types'

export const transactionsApi = {
  getMine: (params?: Record<string, string | number>, signal?: AbortSignal) =>
    api.get<PaginatedResponse<Transaction>>('/transactions/mine/', { params, signal }),

  getById: (id: number, signal?: AbortSignal) =>
    api.get<Transaction>(`/transactions/${id}/`, { signal }),
}
