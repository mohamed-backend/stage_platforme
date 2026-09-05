import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { insurerApi } from '@/api'
import type {
  KYCRecord,
  RiskAssessment,
  InsurerStats,
  CoverageRule,
  InsurerReport,
} from '@/api/insurer.api'

import { useAuthStore } from '@/store'

export function useInsurerStats() {
  const { user, isAuthenticated } = useAuthStore()
  const isAllowed = isAuthenticated && (user?.role === 'INSURER' || user?.role === 'ADMIN')
  return useQuery({
    queryKey: ['insurer', 'stats'],
    queryFn: async () => {
      const { data } = await insurerApi.getStats()
      return data as InsurerStats
    },
    enabled: isAllowed,
  })
}

export function usePendingKYC() {
  const { user, isAuthenticated } = useAuthStore()
  const isAllowed = isAuthenticated && (user?.role === 'INSURER' || user?.role === 'ADMIN')
  return useQuery({
    queryKey: ['insurer', 'kyc', 'pending'],
    queryFn: async () => {
      const { data } = await insurerApi.getPendingKYC()
      return Array.isArray(data) ? data as KYCRecord[] : []
    },
    enabled: isAllowed,
  })
}

export function useReviewKYC() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { status: string; rejection_reason?: string } }) =>
      insurerApi.reviewKYC(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insurer', 'kyc'] })
    },
  })
}

export function useInsurerPendingProjects() {
  const { user, isAuthenticated } = useAuthStore()
  const isAllowed = isAuthenticated && (user?.role === 'INSURER' || user?.role === 'ADMIN')
  return useQuery({
    queryKey: ['insurer', 'projects', 'pending'],
    queryFn: async () => {
      const { data } = await insurerApi.getPendingProjects()
      return Array.isArray(data) ? data as any[] : []
    },
    enabled: isAllowed,
  })
}

export function useInsurerRiskAssessments(params?: Record<string, string | number>) {
  const { user, isAuthenticated } = useAuthStore()
  const isAllowed = isAuthenticated && (user?.role === 'INSURER' || user?.role === 'ADMIN')
  return useQuery({
    queryKey: ['insurer', 'assessments', params],
    queryFn: async () => {
      const { data } = await insurerApi.getRiskAssessments(params)
      return Array.isArray(data) ? data as RiskAssessment[] : []
    },
    enabled: isAllowed,
  })
}

export function useRiskByProject(projectId: number | undefined) {
  const { user, isAuthenticated } = useAuthStore()
  const isAllowed = isAuthenticated && (user?.role === 'INSURER' || user?.role === 'ADMIN')
  return useQuery({
    queryKey: ['insurer', 'risk', projectId],
    queryFn: async () => {
      const { data } = await insurerApi.getRiskByProject(projectId as number)
      return data as RiskAssessment
    },
    enabled: isAllowed && !!projectId,
  })
}

export function useCoverageRules() {
  const { user, isAuthenticated } = useAuthStore()
  const isAllowed = isAuthenticated && (user?.role === 'INSURER' || user?.role === 'ADMIN')
  return useQuery({
    queryKey: ['insurer', 'coverage'],
    queryFn: async () => {
      const { data } = await insurerApi.getCoverageRules()
      return Array.isArray(data) ? data as CoverageRule[] : []
    },
    enabled: isAllowed,
  })
}

export function useCreateCoverageRule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<CoverageRule>) => insurerApi.createCoverageRule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insurer', 'coverage'] })
    },
  })
}

export function useUpdateCoverageRule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CoverageRule> }) =>
      insurerApi.updateCoverageRule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insurer', 'coverage'] })
    },
  })
}

export function useDeleteCoverageRule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => insurerApi.deleteCoverageRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insurer', 'coverage'] })
    },
  })
}

export function useInsurerReports() {
  const { user, isAuthenticated } = useAuthStore()
  const isAllowed = isAuthenticated && (user?.role === 'INSURER' || user?.role === 'ADMIN')
  return useQuery({
    queryKey: ['insurer', 'reports'],
    queryFn: async () => {
      const { data } = await insurerApi.getReports()
      return data
    },
    enabled: isAllowed,
  })
}

export function useGenerateReport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { report_type: string; title: string }) =>
      insurerApi.generateReport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insurer', 'reports'] })
    },
  })
}
