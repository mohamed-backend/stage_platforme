import type { RiskLevel } from './project'

export interface RiskAssessment {
  id: number
  project: number
  project_title?: string
  risk_score: number
  risk_level: RiskLevel
  probability: number
  impact: number
  explanation: string
  model_version?: string
  assessed_at?: string
  created_at: string
}
