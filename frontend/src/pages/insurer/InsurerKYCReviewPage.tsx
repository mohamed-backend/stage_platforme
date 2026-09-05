import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout'
import { Card, Button, EmptyState, Badge, Skeleton, Modal } from '@/components/common'
import { usePendingKYC, useReviewKYC } from '@/hooks'
import { formatDate } from '@/utils'
import { FileCheck, CheckCircle2, XCircle, ExternalLink } from 'lucide-react'
import type { KYCRecord } from '@/api/insurer.api'

export default function InsurerKYCReviewPage() {
  const location = useLocation()
  const { data: kycList, isLoading, refetch } = usePendingKYC()
  const reviewKYC = useReviewKYC()
  const [selectedKYC, setSelectedKYC] = useState<KYCRecord | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [selectedKYCIds, setSelectedKYCIds] = useState<number[]>([])
  const [isBatchProcessing, setIsBatchProcessing] = useState(false)
  const [isBatchReject, setIsBatchReject] = useState(false)

  const pendingKYCItems = kycList || []
  const allSelected = pendingKYCItems.length > 0 && pendingKYCItems.every((item) => selectedKYCIds.includes(item.id))

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedKYCIds([])
    } else {
      setSelectedKYCIds(pendingKYCItems.map((item) => item.id))
    }
  }

  const toggleSelect = (id: number) => {
    setSelectedKYCIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleApprove = (id: number) => {
    reviewKYC.mutate(
      { id, data: { status: 'APPROVED' } },
      { onSuccess: () => { setSelectedKYC(null); refetch() } }
    )
  }

  const handleBatchApprove = async () => {
    if (selectedKYCIds.length === 0) return
    setIsBatchProcessing(true)
    try {
      await Promise.all(
        selectedKYCIds.map((id) =>
          reviewKYC.mutateAsync({ id, data: { status: 'APPROVED' } })
        )
      )
      setSelectedKYCIds([])
      refetch()
    } catch {
      // error
    } finally {
      setIsBatchProcessing(false)
    }
  }

  const handleBatchRejectConfirm = async () => {
    if (selectedKYCIds.length === 0 || !rejectReason.trim()) return
    setIsBatchProcessing(true)
    try {
      await Promise.all(
        selectedKYCIds.map((id) =>
          reviewKYC.mutateAsync({
            id,
            data: { status: 'REJECTED', rejection_reason: rejectReason },
          })
        )
      )
      setSelectedKYCIds([])
      setRejectReason('')
      setShowRejectModal(false)
      setIsBatchReject(false)
      refetch()
    } catch {
      // error
    } finally {
      setIsBatchProcessing(false)
    }
  }

  const handleReject = () => {
    if (isBatchReject) {
      handleBatchRejectConfirm()
      return
    }
    if (!selectedKYC) return
    reviewKYC.mutate(
      { id: selectedKYC.id, data: { status: 'REJECTED', rejection_reason: rejectReason } },
      { onSuccess: () => { setSelectedKYC(null); setRejectReason(''); setShowRejectModal(false); refetch() } }
    )
  }

  const openRejectModal = (kyc: KYCRecord) => {
    setIsBatchReject(false)
    setSelectedKYC(kyc)
    setShowRejectModal(true)
  }

  const openBatchRejectModal = () => {
    setIsBatchReject(true)
    setSelectedKYC(null)
    setShowRejectModal(true)
  }

  return (
    <DashboardLayout currentPath={location.pathname}>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Vérification KYC</h1>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Vérifiez et validez les pièces justificatives d'identité soumises par les utilisateurs.
            </p>
          </div>
          {pendingKYCItems.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSelectAll}
            >
              {allSelected ? 'Tout désélectionner' : 'Sélectionner tout'}
            </Button>
          )}
        </div>

        {/* Batch Actions Header Bar */}
        {selectedKYCIds.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--accent)]/40 bg-[var(--accent-muted)] p-4 shadow-sm animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-bold text-white">
                {selectedKYCIds.length}
              </span>
              <span className="text-sm font-semibold text-[var(--text-primary)]">
                dossier(s) KYC sélectionné(s)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="primary"
                loading={isBatchProcessing}
                onClick={handleBatchApprove}
              >
                <CheckCircle2 className="h-4 w-4 mr-1.5" />
                Approuver la sélection ({selectedKYCIds.length})
              </Button>
              <Button
                size="sm"
                variant="danger"
                loading={isBatchProcessing}
                onClick={openBatchRejectModal}
              >
                <XCircle className="h-4 w-4 mr-1.5" />
                Rejeter la sélection ({selectedKYCIds.length})
              </Button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        ) : !kycList || kycList.length === 0 ? (
          <EmptyState
            title="Aucun dossier KYC en attente"
            description="Tous les dossiers de vérification ont été traités."
            icon={<FileCheck className="h-7 w-7 text-[var(--text-muted)]" />}
          />
        ) : (
          <div className="space-y-4">
            {kycList.map((kyc) => (
              <Card key={kyc.id} className={`p-5 transition-all ${selectedKYCIds.includes(kyc.id) ? 'border-accent bg-accent/5' : ''}`}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={selectedKYCIds.includes(kyc.id)}
                      onChange={() => toggleSelect(kyc.id)}
                      className="mt-4 rounded border-slate-700 bg-slate-800 text-accent focus:ring-accent accent-purple-600 h-4 w-4 cursor-pointer"
                    />
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-light)]">
                      <FileCheck className="h-6 w-6 text-[var(--accent)]" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[var(--text-primary)]">
                        {kyc.username || `Utilisateur #${kyc.user}`}
                      </h3>
                      <p className="mt-1 text-xs text-[var(--text-secondary)]">
                        Soumis le {formatDate(kyc.submitted_at)}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant={kyc.status === 'PENDING' ? 'warning' : 'default'}>
                          {kyc.status === 'PENDING' ? 'En attente' : kyc.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-16 sm:ml-0">
                    {kyc.id_document && (
                      <a
                        href={kyc.id_document}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)] hover:border-[var(--border-default)] hover:bg-[var(--surface-secondary)] transition-all"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Document
                      </a>
                    )}
                    <Button
                      size="sm"
                      variant="primary"
                      loading={reviewKYC.isPending}
                      onClick={() => handleApprove(kyc.id)}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Approuver
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      loading={reviewKYC.isPending}
                      onClick={() => openRejectModal(kyc)}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Rejeter
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => { setShowRejectModal(false); setSelectedKYC(null); setRejectReason('') }}
        title="Rejeter le dossier KYC"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">
            Veuillez indiquer le motif du rejet du dossier de <strong>{selectedKYC?.username || `l'utilisateur #${selectedKYC?.user}`}</strong>.
          </p>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
            placeholder="Ex: Document illisible, date de validité expirée..."
            className="input-fintech h-auto py-2.5 resize-none"
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => { setShowRejectModal(false); setSelectedKYC(null); setRejectReason('') }}
            >
              Annuler
            </Button>
            <Button
              variant="danger"
              loading={reviewKYC.isPending}
              onClick={handleReject}
              disabled={!rejectReason.trim()}
            >
              Confirmer le rejet
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  )
}
