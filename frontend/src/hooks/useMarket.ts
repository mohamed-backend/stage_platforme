import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { marketApi } from '@/api'
import type { PaginatedResponse, Listing } from '@/types'
import { normalizePaginated } from '@/types/api'

export function useMarketListings(params?: Record<string, string | number>) {
  return useQuery<PaginatedResponse<Listing>>({
    queryKey: ['market', params],
    queryFn: async () => {
      const { data } = await marketApi.getMarket(params)
      return normalizePaginated<Listing>(data)
    },
  })
}

import { useAuthStore } from '@/store'

export function useMyListings(params?: Record<string, string | number>) {
  const { isAuthenticated } = useAuthStore()
  return useQuery<PaginatedResponse<Listing>>({
    queryKey: ['myListings', params],
    queryFn: async () => {
      const { data } = await marketApi.getMine(params)
      return normalizePaginated<Listing>(data)
    },
    enabled: isAuthenticated,
  })
}

export function useListing(id: number) {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: async () => {
      const { data } = await marketApi.getById(id)
      return data as Listing
    },
    enabled: !!id,
  })
}

export function useCreateListing() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { investment_id: number; price: number }) =>
      marketApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market'] })
      queryClient.invalidateQueries({ queryKey: ['myListings'] })
    },
  })
}

export function useCancelListing() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => marketApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market'] })
      queryClient.invalidateQueries({ queryKey: ['myListings'] })
    },
  })
}

export function useBuyListing() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => marketApi.buy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market'] })
      queryClient.invalidateQueries({ queryKey: ['myListings'] })
      queryClient.invalidateQueries({ queryKey: ['investments'] })
    },
  })
}
