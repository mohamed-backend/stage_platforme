import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { poolsApi } from '@/api'
import type { PaginatedResponse, Pool } from '@/types'
import { normalizePaginated } from '@/types/api'

export function usePools(params?: Record<string, string | number>) {
  return useQuery<PaginatedResponse<Pool>>({
    queryKey: ['pools', params],
    queryFn: async () => {
      const { data } = await poolsApi.getAll(params)
      return normalizePaginated<Pool>(data)
    },
  })
}

export function usePool(id: number | string | undefined) {
  const numericId = typeof id === 'string' ? Number(id) : id
  return useQuery({
    queryKey: ['pool', numericId],
    queryFn: async () => {
      const { data } = await poolsApi.getById(numericId as number)
      return data as Pool
    },
    enabled: !!numericId && !isNaN(numericId),
  })
}

import { useAuthStore } from '@/store'

export function useMyPools() {
  const { isAuthenticated } = useAuthStore()
  return useQuery<PaginatedResponse<Pool>>({
    queryKey: ['pools', 'mine'],
    queryFn: async () => {
      const { data } = await poolsApi.getMine()
      return normalizePaginated<Pool>(data)
    },
    enabled: isAuthenticated,
  })
}

export function useCreatePool() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      project: number
      minimum_investment: number
      start_date: string
      end_date: string
    }) => poolsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pools'] })
    },
  })
}
