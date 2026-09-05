import api from './axios'
import type { Listing, PaginatedResponse } from '@/types'

export const marketApi = {
  getMarket: (params?: Record<string, string | number>, signal?: AbortSignal) =>
    api.get<PaginatedResponse<Listing>>('/secondary-market/market/', { params, signal }),

  getMine: (params?: Record<string, string | number>, signal?: AbortSignal) =>
    api.get<PaginatedResponse<Listing>>('/secondary-market/mine/', { params, signal }),

  getById: (id: number, signal?: AbortSignal) =>
    api.get<Listing>(`/secondary-market/${id}/`, { signal }),

  create: (data: { investment_id: number; price: number }, signal?: AbortSignal) =>
    api.post<Listing>('/secondary-market/', data, { signal }),

  cancel: (id: number, signal?: AbortSignal) =>
    api.post(`/secondary-market/${id}/cancel/`, undefined, { signal }),

  buy: (id: number, signal?: AbortSignal) =>
    api.post<Listing>(`/secondary-market/${id}/buy/`, undefined, { signal }),
}
