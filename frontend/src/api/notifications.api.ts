import api from './axios'
import type { Notification, PaginatedResponse } from '@/types'

export const notificationsApi = {
  getAll: (params?: Record<string, string | number>, signal?: AbortSignal) =>
    api.get<PaginatedResponse<Notification>>('/notifications/', { params, signal }),

  markAsRead: (id: number, signal?: AbortSignal) =>
    api.post(`/notifications/${id}/read/`, {}, { signal }),

  markAllAsRead: (signal?: AbortSignal) =>
    api.post('/notifications/read-all/', {}, { signal }),
}
