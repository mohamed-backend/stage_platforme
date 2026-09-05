import { useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout'
import { Card, Badge, Skeleton, EmptyState } from '@/components/common'
import { useClaims, useReviewClaim } from '@/hooks'
import { formatDate, formatCurrency } from '@/utils'
import {
  FileText, Clock, CheckCircle2, XCircle,
  Search, Filter, AlertTriangle,
} from 'lucide-react'
import type { ClaimStatus, ClaimType } from '@/types'

const claimTypeLabels: Record<ClaimType, string> = {
  PROJECT_FAILURE: 'Défaillance projet',
  PAYMENT_ISSUE: 'Problème de paiement',
  PLATFORM_ISSUE: 'Problème plateforme',
  OTHER: 'Autre',
}

const statusConfig: Record<string, { icon: React.ReactNode; variant: string; label: string }> = {
  SUBMITTED: { icon: <Clock className="h-4 w-4" />, variant: 'warning', label: 'Soumise' },
  UNDER_REVIEW: { icon: <Clock className="h-4 w-4" />, variant: 'warning', label: 'En revue' },
  APPROVED: { icon: <CheckCircle2 className="h-4 w-4" />, variant: 'success', label: 'Approuvée' },
  REJECTED: { icon: <XCircle className="h-4 w-4" />, variant: 'danger', label: 'Rejetée' },
  PAID: { icon: <CheckCircle2 className="h-4 w-4" />, variant: 'success', label: 'Indemnisée' },
  CLOSED: { icon: <CheckCircle2 className="h-4 w-4" />, variant: 'default', label: 'Clôturée' },
}

export default function AdminClaimsPage() {
  const location = useLocation()
  const { data, isLoading } = useClaims()
  const claims = data?.results || []
  const reviewClaim = useReviewClaim()
  const [statusFilter, setStatusFilter] = useState<ClaimStatus | ''>('')
  const [search, setSearch] = useState('')

  const filteredClaims = (claims || []).filter((claim) => {
    if (statusFilter && claim.status !== statusFilter) return false
    if (search) {
      const s = search.toLowerCase()
      if (!claim.title.toLowerCase().includes(s) && !claim.claimant_username.toLowerCase().includes(s)) {
        return false
      }
    }
    return true
  })

  const stats = {
    total: (claims || []).length,
    submitted: (claims || []).filter((c) => c.status === 'SUBMITTED').length,
    underReview: (claims || []).filter((c) => c.status === 'UNDER_REVIEW').length,
    resolved: (claims || []).filter((c) => ['APPROVED', 'REJECTED', 'PAID', 'CLOSED'].includes(c.status)).length,
  }

  return (
    <DashboardLayout currentPath={location.pathname}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Gestion des Réclamations</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Consultez et gérez toutes les réclamations des utilisateurs.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--surface-secondary)] border border-[var(--border-subtle)]">
                <FileText className="h-5 w-5 text-[var(--text-secondary)]" />
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)]">Total</p>
                <p className="text-xl font-bold text-[var(--text-primary)]">{stats.total}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--warning-light)]">
                <Clock className="h-5 w-5 text-[var(--warning)]" />
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)]">En attente</p>
                <p className="text-xl font-bold text-[var(--text-primary)]">{stats.submitted + stats.underReview}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--success-light)]">
                <CheckCircle2 className="h-5 w-5 text-[var(--success)]" />
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)]">Résolues</p>
                <p className="text-xl font-bold text-[var(--text-primary)]">{stats.resolved}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--error-light)]">
                <AlertTriangle className="h-5 w-5 text-[var(--error)]" />
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)]">Urgent</p>
                <p className="text-xl font-bold text-[var(--text-primary)]">
                  {(claims || []).filter((c) => c.priority === 'HIGH' && !['APPROVED', 'REJECTED', 'PAID', 'CLOSED'].includes(c.status)).length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)] pointer-events-none" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-fintech pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-[var(--text-muted)]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ClaimStatus | '')}
              className="input-fintech w-auto cursor-pointer"
            >
              <option value="">Tous les statuts</option>
              <option value="SUBMITTED">Soumise</option>
              <option value="UNDER_REVIEW">En revue</option>
              <option value="APPROVED">Approuvée</option>
              <option value="REJECTED">Rejetée</option>
              <option value="PAID">Indemnisée</option>
              <option value="CLOSED">Clôturée</option>
            </select>
          </div>
        </div>

        {/* Claims List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
        ) : filteredClaims.length === 0 ? (
          <EmptyState
            title="Aucune réclamation"
            description="Aucune réclamation ne correspond à vos critères."
            icon={<FileText className="h-7 w-7" />}
          />
        ) : (
          <Card padding={false}>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-left">
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Réclamation</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Type</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Statut</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Montant</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Réclamant</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {filteredClaims.map((claim) => {
                  const status = statusConfig[claim.status] || statusConfig.SUBMITTED
                  return (
                    <tr key={claim.id} className="hover:bg-[var(--surface-secondary)] transition-colors">
                      <td className="px-6 py-4">
                        <Link to={`/claims/${claim.id}`} className="hover:text-[var(--accent)] transition-colors">
                          <p className="text-sm font-semibold text-[var(--text-primary)] truncate max-w-[250px]">{claim.title}</p>
                          <p className="text-xs text-[var(--text-secondary)] truncate max-w-[250px] mt-0.5">{claim.description}</p>
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-[var(--text-secondary)]">{claimTypeLabels[claim.claim_type] || claim.claim_type}</span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={status.variant as any}>
                          {status.icon}
                          <span className="ml-1">{status.label}</span>
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        {claim.amount_claimed ? (
                          <span className="text-sm font-bold text-[var(--text-primary)]">{formatCurrency(claim.amount_claimed)}</span>
                        ) : (
                          <span className="text-sm text-[var(--text-muted)]">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-[var(--text-secondary)]">{claim.claimant_username}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-[var(--text-muted)]">{formatDate(claim.created_at)}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
