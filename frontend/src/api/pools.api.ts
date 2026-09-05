import api from './axios'
import type { PaginatedResponse, Pool } from '@/types'

export const poolsApi = {
  getAll: (params?: Record<string, string | number>, signal?: AbortSignal) =>
    api.get<PaginatedResponse<Pool>>('/pools/', { params, signal }),

  getById: (id: number, signal?: AbortSignal) =>
    api.get<Pool>(`/pools/${id}/`, { signal }),

  getMine: (signal?: AbortSignal) =>
    api.get<PaginatedResponse<Pool>>('/pools/mine/', { signal }),

  create: (data: {
    project: number
    minimum_investment: number
    start_date: string
    end_date: string
  }, signal?: AbortSignal) =>
    api.post<Pool>('/pools/create/', data, { signal }),
}
