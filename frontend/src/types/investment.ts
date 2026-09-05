import type { Project } from './project'

export interface Investment {
  id: number
  user?: number
  investor?: number
  investor_username?: string
  pool?: number
  project: number
  project_detail?: Project
  project_title?: string
  amount: number
  current_value?: number
  performance?: number
  pool_remaining_amount?: number
  expected_return?: number
  confirmed_at?: string
  status: InvestmentStatus
  created_at: string
  updated_at?: string
}

export type InvestmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'REFUNDED'
