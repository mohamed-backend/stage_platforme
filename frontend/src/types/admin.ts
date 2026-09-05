import type { User } from './user'
import type { PaginatedResponse } from './api'

export type { PaginatedResponse } from './api'

export interface AdminStats {
  total_users: number
  total_projects: number
  total_investments: number
  total_payments: number
  total_transactions: number
  total_listings: number
  total_notifications: number
  total_volume: number
  projects_by_status?: Record<string, number>
  investments_by_status?: Record<string, number>
  users_by_role?: Record<string, number>
}

export interface PublicStats {
  total_projects: number
  total_investors: number
  total_volume: number
  success_rate: number
}
