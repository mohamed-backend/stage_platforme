import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { projectsApi } from '@/api'
import type { PaginatedResponse, Project } from '@/types'
import { normalizePaginated } from '@/types/api'

export function useProjects(params?: Record<string, string | number>) {
  return useQuery<PaginatedResponse<Project>>({
    queryKey: ['projects', params],
    queryFn: async () => {
      const { data } = await projectsApi.getAll(params)
      return normalizePaginated<Project>(data)
    },
  })
}

export function useProject(id: number | string | undefined) {
  const numericId = typeof id === 'string' ? Number(id) : id
  return useQuery({
    queryKey: ['project', numericId],
    queryFn: async () => {
      const { data } = await projectsApi.getById(numericId as number)
      return data as Project
    },
    enabled: !!numericId && !isNaN(numericId),
  })
}

import { useAuthStore } from '@/store'

export function useMyProjects() {
  const { isAuthenticated } = useAuthStore()
  return useQuery<PaginatedResponse<Project>>({
    queryKey: ['projects', 'mine'],
    queryFn: async () => {
      const { data } = await projectsApi.getMine()
      return normalizePaginated<Project>(data)
    },
    enabled: isAuthenticated,
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Project>) => projectsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Project> }) =>
      projectsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export function useSubmitProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => projectsApi.submit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}
