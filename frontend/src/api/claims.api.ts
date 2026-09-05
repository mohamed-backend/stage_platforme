import api from './axios'
import type { Claim, ClaimCreate, ClaimReview, ClaimNote, PaginatedResponse } from '@/types'

export const claimsApi = {
  getAll: (params?: Record<string, string | number>, signal?: AbortSignal) =>
    api.get<PaginatedResponse<Claim>>('/claims/', { params, signal }),

  getById: (id: number, signal?: AbortSignal) =>
    api.get<Claim>(`/claims/${id}/`, { signal }),

  create: (data: ClaimCreate, signal?: AbortSignal) =>
    api.post<Claim>('/claims/', data, { signal }),

  delete: (id: number, signal?: AbortSignal) =>
    api.delete(`/claims/${id}/`, { signal }),

  review: (id: number, data: ClaimReview, signal?: AbortSignal) =>
    api.patch<Claim>(`/claims/${id}/review/`, data, { signal }),

  addNote: (id: number, data: { content: string; is_internal?: boolean }, signal?: AbortSignal) =>
    api.post<ClaimNote>(`/claims/${id}/notes/`, data, { signal }),
}
