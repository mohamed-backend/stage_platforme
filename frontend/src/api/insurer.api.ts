import api from './axios'
import type { Project } from '@/types'

export interface KYCRecord {
  id: number
  user: number
  username?: string
  email?: string
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED'
  id_document: string
  rejection_reason?: string
  submitted_at: string
  reviewed_at?: string
  reviewed_by?: number
}

export interface RiskAssessment {
  id: number
  project: number
  project_title?: string
  risk_score: number
  risk_level: string
  probability: number
  impact: number
  explanation: string
  model_version?: string
  created_at: string
}

export interface InsurerStats {
  total_kyc_pending: number
  total_kyc_reviewed: number
  total_projects_pending: number
  total_projects_reviewed: number
  total_assessments: number
  coverage_count: number
}

export interface CoverageRule {
  id: number
  name: string
  description: string
  max_coverage: number
  premium_rate: number
  risk_levels: string[]
  is_active: boolean
  created_at: string
}

export interface InsurerReport {
  id: number
  title: string
  report_type: string
  data: Record<string, unknown>
  created_at: string
}

export const insurerApi = {
  getStats: (signal?: AbortSignal) =>
    api.get<InsurerStats>('/users/insurer/stats/', { signal }),

  getPendingKYC: (signal?: AbortSignal) =>
    api.get<KYCRecord[]>('/users/insurer/kyc/pending/', { signal }),

  reviewKYC: (id: number, data: { status: string; rejection_reason?: string }, signal?: AbortSignal) =>
    api.patch(`/users/kyc/${id}/review/`, data, { signal }),

  getPendingProjects: (signal?: AbortSignal) =>
    api.get<Project[]>('/projects/admin/pending/', { signal }),

  getRiskAssessments: (params?: Record<string, string | number>, signal?: AbortSignal) =>
    api.get<RiskAssessment[]>('/risk/', { params, signal }),

  getRiskByProject: (projectId: number, signal?: AbortSignal) =>
    api.get<RiskAssessment>(`/risk/project/${projectId}/`, { signal }),

  getCoverageRules: (signal?: AbortSignal) =>
    api.get<CoverageRule[]>('/insurer/coverage/', { signal }),

  createCoverageRule: (data: Partial<CoverageRule>, signal?: AbortSignal) =>
    api.post<CoverageRule>('/insurer/coverage/', data, { signal }),

  updateCoverageRule: (id: number, data: Partial<CoverageRule>, signal?: AbortSignal) =>
    api.patch<CoverageRule>(`/insurer/coverage/${id}/`, data, { signal }),

  deleteCoverageRule: (id: number, signal?: AbortSignal) =>
    api.delete(`/insurer/coverage/${id}/`, { signal }),

  getReports: (signal?: AbortSignal) =>
    api.get<InsurerReport[]>('/insurer/reports/', { signal }),

  generateReport: (data: { report_type: string; title: string }, signal?: AbortSignal) =>
    api.post<InsurerReport>('/insurer/reports/generate/', data, { signal }),
}
