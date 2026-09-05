import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { investmentsApi } from '@/api'
import type { PaginatedResponse, Investment } from '@/types'
import { normalizePaginated } from '@/types/api'

import { useAuthStore } from '@/store'

export function useInvestments(params?: Record<string, string | number>) {
  const { isAuthenticated } = useAuthStore()
  return useQuery<PaginatedResponse<Investment>>({
    queryKey: ['investments', params],
    queryFn: async () => {
      const { data } = await investmentsApi.getMine(params)
      return normalizePaginated<Investment>(data)
    },
    enabled: isAuthenticated,
  })
}

export function useInvestment(id: number | string | undefined) {
  const { isAuthenticated } = useAuthStore()
  const numericId = typeof id === 'string' ? Number(id) : id
  return useQuery({
    queryKey: ['investment', numericId],
    queryFn: async () => {
      const { data } = await investmentsApi.getById(numericId as number)
      return data as Investment
    },
    enabled: isAuthenticated && !!numericId && !isNaN(numericId),
  })
}

export function useCreateInvestment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { pool: number; amount: number }) =>
      investmentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] })
      queryClient.invalidateQueries({ queryKey: ['owner-investments'] })
    },
  })
}

export function useOwnerInvestments(params?: Record<string, string | number>) {
  const { isAuthenticated } = useAuthStore()
  return useQuery<PaginatedResponse<Investment>>({
    queryKey: ['owner-investments', params],
    queryFn: async () => {
      const { data } = await investmentsApi.getOwnerInvestments(params)
      return normalizePaginated<Investment>(data)
    },
    enabled: isAuthenticated,
  })
}
