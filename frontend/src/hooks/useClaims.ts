import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { claimsApi } from '@/api'
import type { Claim, ClaimCreate, ClaimReview, ClaimNote, PaginatedResponse } from '@/types'
import { normalizePaginated } from '@/types/api'

import { useAuthStore } from '@/store'

export function useClaims(params?: Record<string, string | number>) {
  const { isAuthenticated } = useAuthStore()
  return useQuery<PaginatedResponse<Claim>>({
    queryKey: ['claims', params],
    queryFn: async () => {
      const { data } = await claimsApi.getAll(params)
      return normalizePaginated<Claim>(data)
    },
    enabled: isAuthenticated,
  })
}

export function useClaim(id: number | string | undefined) {
  const { isAuthenticated } = useAuthStore()
  const numericId = typeof id === 'string' ? Number(id) : id
  return useQuery({
    queryKey: ['claim', numericId],
    queryFn: async () => {
      const { data } = await claimsApi.getById(numericId as number)
      return data as Claim
    },
    enabled: isAuthenticated && !!numericId && !isNaN(numericId as number),
  })
}

export function useCreateClaim() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ClaimCreate) => claimsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims'] })
    },
  })
}

export function useDeleteClaim() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => claimsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims'] })
    },
  })
}

export function useReviewClaim() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ClaimReview }) =>
      claimsApi.review(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['claims'] })
      queryClient.invalidateQueries({ queryKey: ['claim', variables.id] })
    },
  })
}

export function useAddClaimNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { content: string; is_internal?: boolean } }) =>
      claimsApi.addNote(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['claim', variables.id] })
    },
  })
}
