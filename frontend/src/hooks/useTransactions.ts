import { useQuery } from '@tanstack/react-query'
import { transactionsApi } from '@/api'
import type { PaginatedResponse, Transaction } from '@/types'
import { normalizePaginated } from '@/types/api'

import { useAuthStore } from '@/store'

export function useTransactions(params?: Record<string, string | number>) {
  const { isAuthenticated } = useAuthStore()
  return useQuery<PaginatedResponse<Transaction>>({
    queryKey: ['transactions', params],
    queryFn: async () => {
      const { data } = await transactionsApi.getMine(params)
      return normalizePaginated<Transaction>(data)
    },
    enabled: isAuthenticated,
  })
}

export function useTransaction(id: number) {
  const { isAuthenticated } = useAuthStore()
  return useQuery({
    queryKey: ['transaction', id],
    queryFn: async () => {
      const { data } = await transactionsApi.getById(id)
      return data as Transaction
    },
    enabled: isAuthenticated && !!id,
  })
}
