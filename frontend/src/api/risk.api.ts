import api from './axios'
import type { RiskAssessment, PaginatedResponse } from '@/types'

export const riskApi = {
  getAll: (signal?: AbortSignal) =>
    api.get<PaginatedResponse<RiskAssessment>>('/risk/', { signal }),

  getByProject: (projectId: number, signal?: AbortSignal) =>
    api.get<RiskAssessment>(`/risk/project/${projectId}/`, { signal }),
}
