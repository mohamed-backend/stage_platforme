import { useState } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout'
import { Card, Button, Badge, Skeleton, EmptyState } from '@/components/common'
import { useClaim, useAddClaimNote, useReviewClaim, useDeleteClaim } from '@/hooks'
import { useAuthStore } from '@/store'
import { formatDate, formatCurrency } from '@/utils'
import {
  ArrowLeft, Clock, CheckCircle2, XCircle,
  DollarSign, ShieldAlert, HelpCircle, Send,
  AlertTriangle, User, Lock,
} from 'lucide-react'
import type { ClaimType, ClaimStatus } from '@/types'

const claimTypeLabels: Record<ClaimType, { label: string; icon: React.ReactNode }> = {
  PROJECT_FAILURE: { label: 'Défaillance projet', icon: <ShieldAlert className="h-4 w-4" /> },
  PAYMENT_ISSUE: { label: 'Problème de paiement', icon: <DollarSign className="h-4 w-4" /> },
  PLATFORM_ISSUE: { label: 'Problème plateforme', icon: <AlertTriangle className="h-4 w-4" /> },
  OTHER: { label: 'Autre', icon: <HelpCircle className="h-4 w-4" /> },
}

const statusConfig: Record<string, { icon: React.ReactNode; variant: string; label: string; bg: string; color: string }> = {
  SUBMITTED:    { icon: <Clock className="h-4 w-4" />,        variant: 'warning', label: 'Soumise',    bg: 'var(--warning-light)',   color: 'var(--warning)' },
  UNDER_REVIEW: { icon: <Clock className="h-4 w-4" />,        variant: 'warning', label: 'En revue',   bg: 'var(--warning-light)',   color: 'var(--warning)' },
  APPROVED:     { icon: <CheckCircle2 className="h-4 w-4" />,  variant: 'success', label: 'Approuvée',  bg: 'var(--success-light)',   color: 'var(--success)' },
  REJECTED:     { icon: <XCircle className="h-4 w-4" />,       variant: 'danger',  label: 'Rejetée',    bg: 'var(--error-light)',     color: 'var(--error)' },
  PAID:         { icon: <CheckCircle2 className="h-4 w-4" />,  variant: 'success', label: 'Indemnisée', bg: 'var(--success-light)',   color: 'var(--success)' },
  CLOSED:       { icon: <CheckCircle2 className="h-4 w-4" />,  variant: 'default', label: 'Clôturée',   bg: 'var(--surface-secondary)',color: 'var(--text-muted)' },
}

export default function ClaimDetailPage() {
  const { id } = useParams()
  const location = useLocation()
  const { user } = useAuthStore()
  const { data: claim, isLoading, error } = useClaim(id)
  const addNote = useAddClaimNote()
  const reviewClaim = useReviewClaim()
  const deleteClaim = useDeleteClaim()

  const [noteContent, setNoteContent] = useState('')
  const [submittingNote, setSubmittingNote] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [reviewForm, setReviewForm] = useState({
    status: '' as ClaimStatus | '',
    resolution_note: '',
  })

  const isReviewer = user?.role === 'INSURER' || user?.role === 'ADMIN'
  const canDelete = claim?.status === 'SUBMITTED' && claim?.claimant === user?.id

  if (isLoading) {
    return (
      <DashboardLayout currentPath={location.pathname}>
        <div className="space-y-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </DashboardLayout>
    )
  }

  if (error || !claim) {
    return (
      <DashboardLayout currentPath={location.pathname}>
        <EmptyState
          title="Réclamation introuvable"
          description="Cette réclamation n'existe pas ou vous n'y avez pas accès."
          action={<Link to="/claims"><Button>Retour aux réclamations</Button></Link>}
        />
      </DashboardLayout>
    )
  }

  const typeConfig = claimTypeLabels[claim.claim_type] || claimTypeLabels.OTHER
  const status = statusConfig[claim.status] || statusConfig.SUBMITTED

  const [isInternalNote, setIsInternalNote] = useState(false)
  const [showPublicConfirmModal, setShowPublicConfirmModal] = useState(false)

  const handleAddNoteClick = () => {
    if (!noteContent.trim()) return
    if (!isInternalNote) {
      setShowPublicConfirmModal(true)
    } else {
      executeAddNote(true)
    }
  }

  const executeAddNote = async (internal: boolean) => {
    if (!noteContent.trim()) return
    setSubmittingNote(true)
    try {
      await addNote.mutateAsync({ id: claim.id, data: { content: noteContent, is_internal: internal } })
      setNoteContent('')
      setShowPublicConfirmModal(false)
    } catch {
      // error
    } finally {
      setSubmittingNote(false)
    }
  }

  const handleReview = async (newStatus: ClaimStatus) => {
    try {
      await reviewClaim.mutateAsync({
        id: claim.id,
        data: { status: newStatus, resolution_note: reviewForm.resolution_note },
      })
    } catch {
      // error
    }
  }

  const handleDelete = async () => {
    try {
      await deleteClaim.mutateAsync(claim.id)
      window.location.href = '/claims'
    } catch {
      // error
    }
  }

  return (
    <DashboardLayout currentPath={location.pathname}>
      <div className="space-y-6">
        <Link
          to="/claims"
          className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux réclamations
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 style={{ color: 'var(--text-primary)' }} className="text-2xl font-bold">{claim.title}</h1>
              <Badge variant={status.variant as any}>{status.icon}<span className="ml-1">{status.label}</span></Badge>
            </div>
            <div style={{ color: 'var(--text-muted)' }} className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              <span className="flex items-center gap-1">{typeConfig.icon}{typeConfig.label}</span>
              {claim.amount_claimed && (
                <span style={{ color: 'var(--text-primary)' }} className="font-medium">Montant: {formatCurrency(claim.amount_claimed)}</span>
              )}
              <span>Par {claim.claimant_username} · {formatDate(claim.created_at)}</span>
            </div>
          </div>
          {canDelete && (
            <Button variant="danger" size="sm" onClick={() => setShowDeleteConfirm(true)}>
              Supprimer
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* Description */}
            <Card>
              <h2 style={{ color: 'var(--text-primary)' }} className="text-lg font-bold">Description</h2>
              <p style={{ color: 'var(--text-secondary)' }} className="mt-3 text-sm leading-relaxed whitespace-pre-wrap">{claim.description}</p>
            </Card>

            {/* Resolution Note */}
            {claim.resolution_note && (
              <Card className="border-accent/20" style={{ background: 'var(--accent-muted)' }}>
                <h2 style={{ color: 'var(--text-primary)' }} className="text-lg font-bold">Note de résolution</h2>
                <p style={{ color: 'var(--text-secondary)' }} className="mt-3 text-sm leading-relaxed whitespace-pre-wrap">{claim.resolution_note}</p>
                {claim.resolved_at && (
                  <p style={{ color: 'var(--text-muted)' }} className="mt-3 text-xs">Résolue le {formatDate(claim.resolved_at)}</p>
                )}
              </Card>
            )}

            {/* Notes */}
            <Card>
              <h2 style={{ color: 'var(--text-primary)' }} className="text-lg font-bold">Notes et commentaires</h2>
              <div className="mt-4 space-y-3">
                {(!claim.notes || claim.notes.length === 0) ? (
                  <p style={{ color: 'var(--text-muted)' }} className="text-sm">Aucune note pour le moment.</p>
                ) : (
                  claim.notes.map((note) => (
                    <div
                      key={note.id}
                      className="rounded-xl p-4 transition-all"
                      style={{
                        background: note.is_internal ? 'rgba(245, 158, 11, 0.1)' : 'rgba(14, 165, 233, 0.1)',
                        border: note.is_internal ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(14, 165, 233, 0.3)',
                      }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <User className="h-3.5 w-3.5" style={{ color: 'var(--text-muted)' }} />
                          <span style={{ color: 'var(--text-primary)' }} className="text-xs font-semibold">{note.author_username}</span>
                          <span style={{ color: 'var(--text-muted)' }} className="text-xs">· {formatDate(note.created_at)}</span>
                        </div>
                        {note.is_internal ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                            <Lock className="h-3 w-3" /> Note interne
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/20 px-2.5 py-0.5 text-xs font-medium text-sky-600 dark:text-sky-400">
                            <CheckCircle2 className="h-3 w-3" /> Réponse publique
                          </span>
                        )}
                      </div>
                      <p style={{ color: 'var(--text-secondary)' }} className="mt-2 text-sm whitespace-pre-wrap">{note.content}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Note */}
              <div className="mt-6 border-t pt-4" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="flex items-center justify-between mb-2">
                  <label style={{ color: 'var(--text-secondary)' }} className="text-sm font-medium">
                    Ajouter une note ou réponse
                  </label>
                  {isReviewer && (
                    <div className="flex items-center gap-2 rounded-lg p-1 bg-surface-secondary">
                      <button
                        type="button"
                        onClick={() => setIsInternalNote(true)}
                        className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                          isInternalNote
                            ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 font-semibold'
                            : 'text-text-muted hover:text-text-primary'
                        }`}
                      >
                        <Lock className="h-3 w-3" /> Internal
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsInternalNote(false)}
                        className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                          !isInternalNote
                            ? 'bg-sky-500/20 text-sky-600 dark:text-sky-400 font-semibold'
                            : 'text-text-muted hover:text-text-primary'
                        }`}
                      >
                        <CheckCircle2 className="h-3 w-3" /> Public
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder={
                      isInternalNote
                        ? 'Rédiger une note interne (réservée aux équipes de gestion)...'
                        : 'Rédiger un message public pour le réclamant...'
                    }
                    rows={3}
                    className="input-fintech flex-1"
                  />
                  <Button
                    className="shrink-0 self-end"
                    disabled={!noteContent.trim() || submittingNote}
                    loading={submittingNote}
                    onClick={handleAddNoteClick}
                  >
                    <Send className="h-4 w-4 mr-1" />
                    {isInternalNote ? 'Sauvegarder' : 'Envoyer'}
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Status Card */}
            <Card style={{ background: status.bg, border: '1px solid var(--border-subtle)' }}>
              <div className="flex items-center gap-3">
                <div style={{ color: status.color }}>{status.icon}</div>
                <div>
                  <p style={{ color: status.color }} className="text-sm font-bold">{status.label}</p>
                  <p style={{ color: status.color }} className="text-xs opacity-70">Statut actuel</p>
                </div>
              </div>
              {claim.resolved_at && (
                <p style={{ color: status.color }} className="mt-3 text-xs">Résolue le {formatDate(claim.resolved_at)}</p>
              )}
            </Card>

            {/* Review Actions (Insurer/Admin only) */}
            {isReviewer && (
              <Card>
                <h3 style={{ color: 'var(--text-primary)' }} className="text-sm font-bold">Actions de review</h3>
                <div className="mt-3 space-y-2">
                  {(['UNDER_REVIEW', 'APPROVED', 'REJECTED', 'PAID', 'CLOSED'] as ClaimStatus[]).map((s) => {
                    const sConfig = statusConfig[s]
                    return (
                      <Button
                        key={s}
                        variant={claim.status === s ? 'primary' : 'outline'}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => handleReview(s)}
                      >
                        {sConfig.icon}
                        <span className="ml-2">{sConfig.label}</span>
                      </Button>
                    )
                  })}
                </div>
                <div className="mt-4">
                  <label style={{ color: 'var(--text-secondary)' }} className="mb-1.5 block text-xs font-medium">Note de résolution</label>
                  <textarea
                    value={reviewForm.resolution_note}
                    onChange={(e) => setReviewForm({ ...reviewForm, resolution_note: e.target.value })}
                    placeholder="Ajoutez une note..."
                    rows={3}
                    className="input-fintech w-full text-sm"
                  />
                </div>
              </Card>
            )}

            {/* Info */}
            <Card>
              <h3 style={{ color: 'var(--text-primary)' }} className="text-sm font-bold">Informations</h3>
              <div className="mt-3 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Type</span>
                  <span style={{ color: 'var(--text-primary)' }} className="font-medium">{typeConfig.label}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Priorité</span>
                  <Badge variant={claim.priority === 'HIGH' ? 'danger' : claim.priority === 'MEDIUM' ? 'warning' : 'default'}>
                    {claim.priority}
                  </Badge>
                </div>
                {claim.investment && (
                  <div className="flex items-center justify-between">
                    <span style={{ color: 'var(--text-secondary)' }}>Investissement</span>
                    <Link to={`/investments/${claim.investment}`} style={{ color: 'var(--accent)' }} className="hover:underline">
                      #{claim.investment}
                    </Link>
                  </div>
                )}
                {claim.assigned_to && (
                  <div className="flex items-center justify-between">
                    <span style={{ color: 'var(--text-secondary)' }}>Assigné à</span>
                    <span style={{ color: 'var(--text-primary)' }} className="font-medium">{claim.assigned_to_username}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Créée le</span>
                  <span style={{ color: 'var(--text-primary)' }} className="font-medium">{formatDate(claim.created_at)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Modifiée le</span>
                  <span style={{ color: 'var(--text-primary)' }} className="font-medium">{formatDate(claim.updated_at)}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-backdrop">
          <div className="modal-dialog max-w-md">
            <div className="modal-header">
              <h3 style={{ color: 'var(--text-primary)' }} className="text-lg font-bold">Supprimer la réclamation ?</h3>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
                Cette action est irréversible. Êtes-vous sûr de vouloir supprimer cette réclamation ?
              </p>
            </div>
            <div className="modal-footer">
              <Button variant="outline" className="flex-1" onClick={() => setShowDeleteConfirm(false)}>Annuler</Button>
              <Button
                className="flex-1"
                variant="danger"
                loading={deleteClaim.isPending}
                onClick={handleDelete}
              >
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Public Note Confirmation Modal */}
      {showPublicConfirmModal && (
        <div className="modal-backdrop">
          <div className="modal-dialog max-w-md">
            <div className="modal-header flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-sky-500" />
              <h3 style={{ color: 'var(--text-primary)' }} className="text-lg font-bold">Confirmer l'envoi du message public</h3>
            </div>
            <div className="modal-body space-y-3">
              <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
                Attention : Ce message sera visible par le réclamant et l'ensemble des parties prenantes autorisées.
              </p>
              <div className="rounded-lg p-3 bg-sky-500/10 border border-sky-500/30 text-xs italic text-sky-700 dark:text-sky-300">
                "{noteContent}"
              </div>
            </div>
            <div className="modal-footer">
              <Button variant="outline" className="flex-1" onClick={() => setShowPublicConfirmModal(false)}>
                Annuler
              </Button>
              <Button
                className="flex-1"
                loading={submittingNote}
                onClick={() => executeAddNote(false)}
              >
                Confirmer & Envoyer
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
