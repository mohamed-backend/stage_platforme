import api from './axios'
import type { AdminStats, PaginatedResponse, PublicStats, User, Project, Investment, Payment, Transaction, Listing, Notification } from '@/types'

export const adminApi = {
  getStats: (signal?: AbortSignal) =>
    api.get<AdminStats>('/users/admin/stats/', { signal }),

  getPublicStats: (signal?: AbortSignal) =>
    api.get<PublicStats>('/users/stats/public/', { signal }),

  getUsers: (params?: Record<string, string | number>, signal?: AbortSignal) =>
    api.get<PaginatedResponse<User>>('/users/admin/users/', { params, signal }),

  updateUser: (id: number, data: Partial<User>, signal?: AbortSignal) =>
    api.patch<User>(`/users/admin/users/${id}/`, data, { signal }),

  deleteUser: (id: number, signal?: AbortSignal) =>
    api.delete(`/users/admin/users/${id}/`, { signal }),

  getProjects: (params?: Record<string, string | number>, signal?: AbortSignal) =>
    api.get<PaginatedResponse<Project>>('/projects/admin/projects/', { params, signal }),

  updateProject: (id: number, data: Record<string, unknown>, signal?: AbortSignal) =>
    api.patch(`/projects/admin/projects/${id}/`, data, { signal }),

  deleteProject: (id: number, signal?: AbortSignal) =>
    api.delete(`/projects/admin/projects/${id}/`, { signal }),

  approveProject: (id: number, signal?: AbortSignal) =>
    api.post(`/projects/${id}/approve/`, undefined, { signal }),

  rejectProject: (id: number, signal?: AbortSignal) =>
    api.post(`/projects/${id}/reject/`, undefined, { signal }),

  getPendingProjects: (signal?: AbortSignal) =>
    api.get('/projects/admin/pending/', { signal }),

  getInvestments: (params?: Record<string, string | number>, signal?: AbortSignal) =>
    api.get<PaginatedResponse<Investment>>('/investments/admin/investments/', { params, signal }),

  getPayments: (params?: Record<string, string | number>, signal?: AbortSignal) =>
    api.get<PaginatedResponse<Payment>>('/payments/admin/payments/', { params, signal }),

  getTransactions: (params?: Record<string, string | number>, signal?: AbortSignal) =>
    api.get<PaginatedResponse<Transaction>>('/transactions/admin/transactions/', { params, signal }),

  getListings: (params?: Record<string, string | number>, signal?: AbortSignal) =>
    api.get<PaginatedResponse<Listing>>('/secondary-market/admin/listings/', { params, signal }),

  getNotifications: (params?: Record<string, string | number>, signal?: AbortSignal) =>
    api.get<PaginatedResponse<Notification>>('/notifications/admin/notifications/', { params, signal }),
}
