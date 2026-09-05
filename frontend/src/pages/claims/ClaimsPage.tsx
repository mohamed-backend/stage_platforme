import { useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout'
import { Card, Button, Badge, Skeleton, EmptyState, Modal } from '@/components/common'
import { useClaims, useCreateClaim } from '@/hooks'
import { formatDate, formatCurrency } from '@/utils'
import {
  FileText, Plus, AlertCircle, CheckCircle2, Clock,
  XCircle, DollarSign, ShieldAlert, HelpCircle,
} from 'lucide-react'
import type { ClaimType } from '@/types'

const claimTypeLabels: Record<ClaimType, { label: string; icon: React.ReactNode }> = {
  PROJECT_FAILURE: { label: 'Défaillance projet', icon: <ShieldAlert className="h-4 w-4" /> },
  PAYMENT_ISSUE: { label: 'Problème de paiement', icon: <DollarSign className="h-4 w-4" /> },
  PLATFORM_ISSUE: { label: 'Problème plateforme', icon: <AlertCircle className="h-4 w-4" /> },
  OTHER: { label: 'Autre', icon: <HelpCircle className="h-4 w-4" /> },
}

const statusConfig: Record<string, { icon: React.ReactNode; variant: string; label: string }> = {
  SUBMITTED: { icon: <Clock className="h-4 w-4" />, variant: 'warning', label: 'Soumise' },
  UNDER_REVIEW: { icon: <Clock className="h-4 w-4" />, variant: 'warning', label: 'En revue' },
  APPROVED: { icon: <CheckCircle2 className="h-4 w-4" />, variant: 'success', label: 'Approuvée' },
  REJECTED: { icon: <XCircle className="h-4 w-4" />, variant: 'danger', label: 'Rejetée' },
  PAID: { icon: <CheckCircle2 className="h-4 w-4" />, variant: 'success', label: 'Indemnisée' },
  CLOSED: { icon: <CheckCircle2 className="h-4 w-4" />, variant: 'default', label: 'Clôturée' },
}

export default function ClaimsPage() {
  const location = useLocation()
  const { data, isLoading } = useClaims()
  const claims = data?.results || []
  const createClaim = useCreateClaim()
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({
    claim_type: 'OTHER' as ClaimType,
    title: '',
    description: '',
    amount_claimed: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.description.trim()) return
    setSubmitting(true)
    try {
      await createClaim.mutateAsync({
        claim_type: form.claim_type,
        title: form.title,
        description: form.description,
        amount_claimed: form.amount_claimed ? Number(form.amount_claimed) : undefined,
      })
      setSuccess(true)
      setShowCreate(false)
      setForm({ claim_type: 'OTHER', title: '', description: '', amount_claimed: '' })
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      // error
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DashboardLayout currentPath={location.pathname}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 style={{ color: 'var(--text-primary)' }} className="text-3xl font-bold tracking-tight lg:text-[32px]">Réclamations</h1>
            <p style={{ color: 'var(--text-secondary)' }} className="mt-2 text-base">Gérez vos réclamations et suivez leur traitement.</p>
          </div>
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4" />
            Nouvelle réclamation
          </Button>
        </div>

        {success && (
          <div
            className="rounded-xl p-4 flex items-center gap-2"
            style={{ background: 'var(--success-light)', color: 'var(--success)', border: '1px solid var(--border-subtle)' }}
          >
            <CheckCircle2 className="h-5 w-5" />
            <p className="text-sm">Réclamation soumise avec succès.</p>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
        ) : claims.length === 0 ? (
          <EmptyState
            title="Aucune réclamation"
            description="Vous n'avez pas encore soumis de réclamation."
            icon={<FileText className="h-7 w-7" />}
            action={
              <Button onClick={() => setShowCreate(true)}>
                <Plus className="h-4 w-4" />
                Nouvelle réclamation
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {claims.map((claim) => {
              const typeConfig = claimTypeLabels[claim.claim_type] || claimTypeLabels.OTHER
              const status = statusConfig[claim.status] || statusConfig.SUBMITTED
              return (
                <Link key={claim.id} to={`/claims/${claim.id}`}>
                  <Card hover className="cursor-pointer">
                    <div className="flex items-start gap-4">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                        style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}
                      >
                        {typeConfig.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 style={{ color: 'var(--text-primary)' }} className="text-sm font-bold truncate">{claim.title}</h3>
                            <p style={{ color: 'var(--text-secondary)' }} className="mt-1 text-xs line-clamp-2">{claim.description}</p>
                          </div>
                          <Badge variant={status.variant as any} className="shrink-0">
                            {status.icon}
                            <span className="ml-1">{status.label}</span>
                          </Badge>
                        </div>
                        <div style={{ color: 'var(--text-muted)' }} className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                          <span>{typeConfig.label}</span>
                          {claim.amount_claimed && (
                            <span style={{ color: 'var(--text-primary)' }} className="font-medium">
                              Montant réclamé: {formatCurrency(claim.amount_claimed)}
                            </span>
                          )}
                          <span>Soumise le {formatDate(claim.created_at)}</span>
                          {claim.notes && claim.notes.length > 0 && (
                            <span>{claim.notes.length} note{claim.notes.length > 1 ? 's' : ''}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="Nouvelle réclamation"
      >
        <div className="space-y-4">
          <div>
            <label style={{ color: 'var(--text-secondary)' }} className="mb-1.5 block text-sm font-medium">Type de réclamation</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(claimTypeLabels) as [ClaimType, { label: string; icon: React.ReactNode }][]).map(
                ([key, config]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setForm({ ...form, claim_type: key })}
                    className="flex items-center gap-2 rounded-xl p-3 text-left text-sm transition-all"
                    style={{
                      border: form.claim_type === key ? '2px solid var(--accent)' : '1px solid var(--border-subtle)',
                      background: form.claim_type === key ? 'var(--accent-muted)' : 'var(--surface-secondary)',
                      color: form.claim_type === key ? 'var(--accent)' : 'var(--text-secondary)',
                    }}
                  >
                    <span className="shrink-0">{config.icon}</span>
                    <span className="text-xs font-semibold">{config.label}</span>
                  </button>
                )
              )}
            </div>
          </div>

          <div>
            <label style={{ color: 'var(--text-secondary)' }} className="mb-1.5 block text-sm font-medium">Titre</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Décrivez brièvement votre réclamation"
              className="input-fintech w-full"
            />
          </div>

          <div>
            <label style={{ color: 'var(--text-secondary)' }} className="mb-1.5 block text-sm font-medium">Description détaillée</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Expliquez votre situation en détail..."
              rows={4}
              className="input-fintech w-full"
            />
          </div>

          <div>
            <label style={{ color: 'var(--text-secondary)' }} className="mb-1.5 block text-sm font-medium">Montant réclamé (optionnel)</label>
            <input
              type="number"
              value={form.amount_claimed}
              onChange={(e) => setForm({ ...form, amount_claimed: e.target.value })}
              placeholder="0.00"
              className="input-fintech w-full"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowCreate(false)}>
              Annuler
            </Button>
            <Button
              className="flex-1"
              disabled={!form.title.trim() || !form.description.trim() || submitting}
              loading={submitting}
              onClick={handleSubmit}
            >
              Soumettre
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  )
}
