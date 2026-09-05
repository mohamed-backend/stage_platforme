export type ClaimStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'PAID' | 'CLOSED'
export type ClaimType = 'PROJECT_FAILURE' | 'PAYMENT_ISSUE' | 'PLATFORM_ISSUE' | 'OTHER'
export type ClaimPriority = 'LOW' | 'MEDIUM' | 'HIGH'

export interface ClaimNote {
  id: number
  claim: number
  author: number
  author_username: string | null
  is_internal: boolean
  content: string
  created_at: string
}

export interface Claim {
  id: number
  claimant: number
  claimant_username: string
  investment: number | null
  claim_type: ClaimType
  title: string
  description: string
  amount_claimed: number | null
  status: ClaimStatus
  priority: ClaimPriority
  assigned_to: number | null
  assigned_to_username: string | null
  resolution_note: string
  resolved_at: string | null
  notes: ClaimNote[]
  created_at: string
  updated_at: string
}

export interface ClaimCreate {
  claim_type: ClaimType
  title: string
  description: string
  amount_claimed?: number
  investment?: number
}

export interface ClaimReview {
  status: ClaimStatus
  priority?: ClaimPriority
  assigned_to?: number
  resolution_note?: string
}
