export interface Project {
  id: number
  title: string
  description: string
  owner?: number
  owner_username?: string
  target_amount: number
  collected_amount: number
  minimum_investment: number
  expected_return: number
  duration_months: number
  risk_level: RiskLevel
  risk_type?: string
  investor_count?: number
  status: ProjectStatus
  category?: string
  image?: string
  pool?: Pool | null
  created_at: string
  updated_at?: string
}

export type ProjectStatus = 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'REJECTED' | 'CLOSED'

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH'

export interface Pool {
  id: number
  project: number
  project_title?: string
  name?: string
  target_amount?: number
  collected_amount?: number
  remaining_amount?: number
  funding_percentage?: number
  minimum_investment?: number
  start_date?: string
  end_date?: string
  amount?: number
  status: 'OPEN' | 'FUNDED' | 'CLOSED' | 'CANCELLED' | string
  created_at: string
}
