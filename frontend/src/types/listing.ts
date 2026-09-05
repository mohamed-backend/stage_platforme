import type { Project } from './project'

export interface Listing {
  id: number
  investment?: number
  investment_detail?: {
    id: number
    amount: number
    project: number
    project_title?: string
    expected_return?: number
  }
  seller?: number
  seller_username?: string
  project?: number
  project_detail?: Project
  price: number
  expected_return?: number
  risk_level?: string
  status: ListingStatus
  created_at: string
}

export type ListingStatus = 'ACTIVE' | 'SOLD' | 'CANCELLED'
