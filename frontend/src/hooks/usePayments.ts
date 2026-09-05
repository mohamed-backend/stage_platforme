import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { paymentsApi } from '@/api'
import type { PaginatedResponse, Payment } from '@/types'
import { normalizePaginated } from '@/types/api'

import { useAuthStore } from '@/store'

export function usePayments(params?: Record<string, string | number>) {
  const { isAuthenticated } = useAuthStore()
  return useQuery<PaginatedResponse<Payment>>({
    queryKey: ['payments', params],
    queryFn: async () => {
      const { data } = await paymentsApi.getMine(params)
      return normalizePaginated<Payment>(data)
    },
    enabled: isAuthenticated,
  })
}

export function usePayment(id: number) {
  const { isAuthenticated } = useAuthStore()
  return useQuery({
    queryKey: ['payment', id],
    queryFn: async () => {
      const { data } = await paymentsApi.getById(id)
      return data as Payment
    },
    enabled: isAuthenticated && !!id,
  })
}

export function useCreatePayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { investment_id: number; method: string }) =>
      paymentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
    },
  })
}

export function useConfirmPayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => paymentsApi.confirm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      queryClient.invalidateQueries({ queryKey: ['investments'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}
