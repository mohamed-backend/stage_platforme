import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/api'
import type { AdminStats, PublicStats, User, Project, Investment, Payment, Transaction, Listing, Notification, PaginatedResponse } from '@/types'
import { normalizePaginated } from '@/types/api'

import { useAuthStore } from '@/store'

export function useAdminUsers(params?: Record<string, string | number>) {
  const { user, isAuthenticated } = useAuthStore()
  return useQuery<PaginatedResponse<User>>({
    queryKey: ['adminUsers', params],
    queryFn: async () => {
      const { data } = await adminApi.getUsers(params)
      return normalizePaginated<User>(data)
    },
    enabled: isAuthenticated && user?.role === 'ADMIN',
  })
}

export function useAdminProjects(params?: Record<string, string | number>) {
  const { user, isAuthenticated } = useAuthStore()
  return useQuery<PaginatedResponse<Project>>({
    queryKey: ['adminProjects', params],
    queryFn: async () => {
      const { data } = await adminApi.getProjects(params)
      return normalizePaginated<Project>(data)
    },
    enabled: isAuthenticated && user?.role === 'ADMIN',
  })
}

export function useAdminPendingProjects() {
  const { user, isAuthenticated } = useAuthStore()
  return useQuery<Project[]>({
    queryKey: ['adminProjects', 'pending'],
    queryFn: async () => {
      const { data } = await adminApi.getPendingProjects()
      return data as Project[]
    },
    enabled: isAuthenticated && user?.role === 'ADMIN',
  })
}

export function useAdminInvestments(params?: Record<string, string | number>) {
  const { user, isAuthenticated } = useAuthStore()
  return useQuery<PaginatedResponse<Investment>>({
    queryKey: ['adminInvestments', params],
    queryFn: async () => {
      const { data } = await adminApi.getInvestments(params)
      return normalizePaginated<Investment>(data)
    },
    enabled: isAuthenticated && user?.role === 'ADMIN',
  })
}

export function useAdminPayments(params?: Record<string, string | number>) {
  const { user, isAuthenticated } = useAuthStore()
  return useQuery<PaginatedResponse<Payment>>({
    queryKey: ['adminPayments', params],
    queryFn: async () => {
      const { data } = await adminApi.getPayments(params)
      return normalizePaginated<Payment>(data)
    },
    enabled: isAuthenticated && user?.role === 'ADMIN',
  })
}

export function useAdminTransactions(params?: Record<string, string | number>) {
  const { user, isAuthenticated } = useAuthStore()
  return useQuery<PaginatedResponse<Transaction>>({
    queryKey: ['adminTransactions', params],
    queryFn: async () => {
      const { data } = await adminApi.getTransactions(params)
      return normalizePaginated<Transaction>(data)
    },
    enabled: isAuthenticated && user?.role === 'ADMIN',
  })
}

export function useAdminListings(params?: Record<string, string | number>) {
  const { user, isAuthenticated } = useAuthStore()
  return useQuery<PaginatedResponse<Listing>>({
    queryKey: ['adminListings', params],
    queryFn: async () => {
      const { data } = await adminApi.getListings(params)
      return normalizePaginated<Listing>(data)
    },
    enabled: isAuthenticated && user?.role === 'ADMIN',
  })
}

export function useAdminNotifications(params?: Record<string, string | number>) {
  const { user, isAuthenticated } = useAuthStore()
  return useQuery<PaginatedResponse<Notification>>({
    queryKey: ['adminNotifications', params],
    queryFn: async () => {
      const { data } = await adminApi.getNotifications(params)
      return normalizePaginated<Notification>(data)
    },
    enabled: isAuthenticated && user?.role === 'ADMIN',
  })
}

export function useAdminStats() {
  const { user, isAuthenticated } = useAuthStore()
  return useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const { data } = await adminApi.getStats()
      return data as AdminStats
    },
    enabled: isAuthenticated && user?.role === 'ADMIN',
  })
}

export function usePublicStats() {
  return useQuery({
    queryKey: ['publicStats'],
    queryFn: async () => {
      const { data } = await adminApi.getPublicStats()
      return data as PublicStats
    },
    staleTime: 60 * 1000,
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<User> }) =>
      adminApi.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => adminApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
    },
  })
}

export function useUpdateProjectAdmin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) =>
      adminApi.updateProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProjects'] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export function useDeleteProjectAdmin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => adminApi.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProjects'] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export function useApproveProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => adminApi.approveProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProjects'] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export function useRejectProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => adminApi.rejectProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProjects'] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}
