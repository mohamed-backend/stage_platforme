import { useQuery } from '@tanstack/react-query'
import { riskApi } from '@/api'
import type { RiskAssessment, PaginatedResponse } from '@/types'
import { normalizePaginated } from '@/types/api'

export function useRiskAssessments() {
  return useQuery<PaginatedResponse<RiskAssessment>>({
    queryKey: ['risk-assessments'],
    queryFn: async () => {
      const { data } = await riskApi.getAll()
      return normalizePaginated<RiskAssessment>(data)
    },
  })
}

export function useRiskAssessment(projectId: number | string | undefined) {
  const numericId = typeof projectId === 'string' ? Number(projectId) : projectId
  return useQuery({
    queryKey: ['risk', numericId],
    queryFn: async () => {
      const { data } = await riskApi.getByProject(numericId as number)
      return data as RiskAssessment
    },
    enabled: !!numericId && !isNaN(numericId),
  })
}
