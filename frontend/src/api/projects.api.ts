import api from './axios'
import type { PaginatedResponse, Project } from '@/types'

export const projectsApi = {
  getAll: (params?: Record<string, string | number>, signal?: AbortSignal) =>
    api.get<PaginatedResponse<Project>>('/projects/', { params, signal }),

  getById: (id: number, signal?: AbortSignal) =>
    api.get<Project>(`/projects/${id}/`, { signal }),

  getMine: (signal?: AbortSignal) =>
    api.get<PaginatedResponse<Project>>('/projects/mine/', { signal }),

  create: (data: Partial<Project>, signal?: AbortSignal) =>
    api.post<Project>('/projects/', data, { signal }),

  update: (id: number, data: Partial<Project>, signal?: AbortSignal) =>
    api.patch<Project>(`/projects/${id}/`, data, { signal }),

  submit: (id: number, signal?: AbortSignal) =>
    api.post<Project>(`/projects/${id}/submit/`, undefined, { signal }),
}
