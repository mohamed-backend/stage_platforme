import { useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout'
import { Card, Button, Badge, Skeleton, ErrorMessage } from '@/components/common'
import { useKyc } from '@/hooks'
import { authApi } from '@/api'
import { useQueryClient } from '@tanstack/react-query'
import { formatDate } from '@/utils'
import {
  FileText, Upload, CheckCircle2, Clock, AlertCircle,
  XCircle, ArrowLeft, AlertTriangle, Info, Shield,
} from 'lucide-react'

const statusConfig: Record<string, { bg: string; color: string; icon: React.ReactNode; label: string; description: string }> = {
  APPROVED: {
    bg: 'var(--success-light)',
    color: 'var(--success)',
    icon: <CheckCircle2 className="h-5 w-5" style={{ color: 'var(--success)' }} />,
    label: 'Identité vérifiée',
    description: 'Votre identité a été vérifiée avec succès. Vous pouvez investir.',
  },
  PENDING: {
    bg: 'var(--warning-light)',
    color: 'var(--warning)',
    icon: <Clock className="h-5 w-5" style={{ color: 'var(--warning)' }} />,
    label: 'En attente de vérification',
    description: 'Votre dossier est en cours de vérification par notre équipe.',
  },
  UNDER_REVIEW: {
    bg: 'var(--warning-light)',
    color: 'var(--warning)',
    icon: <Clock className="h-5 w-5" style={{ color: 'var(--warning)' }} />,
    label: 'Vérification en cours',
    description: 'Votre dossier est en cours de révision.',
  },
  REJECTED: {
    bg: 'var(--error-light)',
    color: 'var(--error)',
    icon: <XCircle className="h-5 w-5" style={{ color: 'var(--error)' }} />,
    label: 'Dossier rejeté',
    description: 'Votre dossier a été rejeté. Vous pouvez soumettre un nouveau document.',
  },
  NOT_SUBMITTED: {
    bg: 'var(--surface-secondary)',
    color: 'var(--text-muted)',
    icon: <AlertCircle className="h-5 w-5" style={{ color: 'var(--text-muted)' }} />,
    label: 'Non soumis',
    description: 'Soumettez vos documents pour vérifier votre identité.',
  },
}

const stepState = (status: string, index: number): 'done' | 'current' | 'pending' => {
  if (status === 'APPROVED') return 'done'
  if (status === 'REJECTED') return index === 0 ? 'done' : 'current'
  if (status === 'PENDING' || status === 'UNDER_REVIEW') return index <= 1 ? 'done' : 'current'
  return index === 0 ? 'current' : 'pending'
}

const steps = [
  { id: 1, label: 'Document' },
  { id: 2, label: 'Soumission' },
  { id: 3, label: 'Vérification' },
]

export default function KYCPage() {
  const location = useLocation()
  const queryClient = useQueryClient()
  const { data: kycData, isLoading, error, refetch } = useKyc()
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const kycStatus = kycData?.status || 'NOT_SUBMITTED'
  const config = statusConfig[kycStatus] || statusConfig.NOT_SUBMITTED

  const handleSubmit = async () => {
    if (!file) return
    setSubmitting(true)
    setSubmitError(null)

    try {
      const formData = new FormData()
      formData.append('id_document', file)
      await authApi.submitKyc(formData)
      queryClient.invalidateQueries({ queryKey: ['kyc'] })
      setSubmitSuccess(true)
      setFile(null)
      setTimeout(() => setSubmitSuccess(false), 5000)
    } catch (e: unknown) {
      const detail = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setSubmitError(detail || 'Submission error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        setSubmitError('Le fichier dépasse la taille maximale de 10 Mo.')
        return
      }
      setFile(selectedFile)
      setSubmitError(null)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout currentPath={location.pathname}>
        <div className="mx-auto max-w-3xl space-y-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout currentPath={location.pathname}>
        <div className="mx-auto max-w-3xl space-y-6">
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au profil
          </Link>
          <ErrorMessage
            message="Impossible de charger votre dossier KYC."
            onRetry={() => refetch()}
          />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout currentPath={location.pathname}>
      <div className="mx-auto max-w-3xl space-y-6">
        <Link
          to="/profile"
          className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au profil
        </Link>

        <div className="flex items-start gap-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow-md"
            style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)' }}
          >
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 style={{ color: 'var(--text-primary)' }} className="text-2xl sm:text-3xl font-bold tracking-tight">
              Vérification d'identité
            </h1>
          </div>
        </div>

        {/* Stepper */}
        <Card padding={false}>
          <div className="flex items-center px-4 py-5 sm:px-6">
            {steps.map((s, index) => {
              const state = stepState(kycStatus, index)
              return (
                <div key={s.id} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors"
                      style={{
                        background: state === 'done' ? 'var(--success)' : state === 'current' ? 'var(--accent)' : 'var(--surface-secondary)',
                        color: state === 'pending' ? 'var(--text-muted)' : '#ffffff',
                      }}
                    >
                      {state === 'done' ? <CheckCircle2 className="h-5 w-5" /> : s.id}
                    </div>
                    <span
                      className="mt-2 text-[11px] font-medium"
                      style={{ color: state !== 'pending' ? 'var(--text-primary)' : 'var(--text-muted)' }}
                    >
                      {s.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className="mx-2 h-0.5 flex-1 transition-colors"
                      style={{ background: state === 'done' ? 'var(--success)' : 'var(--border-subtle)' }}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </Card>

        <Card className="overflow-hidden" padding={false}>
          <div
            className="flex items-start gap-4 p-6"
            style={{ background: config.bg, borderBottom: '1px solid var(--border-subtle)' }}
          >
            <div className="shrink-0 mt-0.5">{config.icon}</div>
            <div className="flex-1">
              <h2 style={{ color: config.color }} className="text-lg font-bold">{config.label}</h2>
              <p style={{ color: config.color }} className="mt-1 text-sm opacity-80">{config.description}</p>
            </div>
            {kycStatus === 'APPROVED' && (
              <Badge variant="success" className="shrink-0">Vérifié</Badge>
            )}
            {(kycStatus === 'PENDING' || kycStatus === 'UNDER_REVIEW') && (
              <Badge variant="warning" className="shrink-0">En cours</Badge>
            )}
            {kycStatus === 'REJECTED' && (
              <Badge variant="danger" className="shrink-0">Rejeté</Badge>
            )}
          </div>

          {kycStatus === 'REJECTED' && kycData?.rejection_reason && (
            <div className="p-4" style={{ background: 'var(--error-light)', borderBottom: '1px solid var(--border-subtle)' }}>
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" style={{ color: 'var(--error)' }} />
                <div>
                  <p style={{ color: 'var(--error)' }} className="text-sm font-semibold">Motif du rejet</p>
                  <p style={{ color: 'var(--error)' }} className="mt-1 text-sm">{kycData.rejection_reason}</p>
                </div>
              </div>
            </div>
          )}

          {kycStatus !== 'NOT_SUBMITTED' && kycData && (
            <div style={{ borderColor: 'var(--border-subtle)' }} className="divide-y">
              {kycData.submitted_at && (
                <div className="flex items-center justify-between px-6 py-3">
                  <span style={{ color: 'var(--text-secondary)' }} className="text-sm">Date de soumission</span>
                  <span style={{ color: 'var(--text-primary)' }} className="text-sm font-semibold">{formatDate(kycData.submitted_at)}</span>
                </div>
              )}
              {kycData.reviewed_at && (
                <div className="flex items-center justify-between px-6 py-3">
                  <span style={{ color: 'var(--text-secondary)' }} className="text-sm">Date de vérification</span>
                  <span style={{ color: 'var(--text-primary)' }} className="text-sm font-semibold">{formatDate(kycData.reviewed_at)}</span>
                </div>
              )}
            </div>
          )}
        </Card>

        {(kycStatus === 'NOT_SUBMITTED' || kycStatus === 'REJECTED') && (
          <Card>
            <h3 style={{ color: 'var(--text-primary)' }} className="text-lg font-bold">Soumettre vos documents</h3>
            <p style={{ color: 'var(--text-secondary)' }} className="mt-1 text-sm">
              Téléchargez une pièce d'identité valide (passeport, carte d'identité, permis).
            </p>

            {submitSuccess && (
              <div
                className="mt-4 rounded-xl p-4 flex items-center gap-2"
                style={{ background: 'var(--success-light)', color: 'var(--success)' }}
              >
                <CheckCircle2 className="h-5 w-5" />
                <p className="text-sm">Document soumis avec succès !</p>
              </div>
            )}

            {submitError && (
              <div
                className="mt-4 rounded-xl p-4 flex items-center gap-2"
                style={{ background: 'var(--error-light)', color: 'var(--error)' }}
              >
                <XCircle className="h-5 w-5" />
                <p className="text-sm">{submitError}</p>
              </div>
            )}

            <div className="mt-4 space-y-4">
              <label
                className="flex items-center gap-3 rounded-xl p-4 cursor-pointer transition-colors"
                style={{ border: '1px dashed var(--border-strong)', background: 'var(--surface-secondary)' }}
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}
                >
                  <Upload className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p style={{ color: 'var(--text-primary)' }} className="text-sm font-semibold">
                    {file ? file.name : 'Choisir un fichier'}
                  </p>
                  {file && (
                    <p style={{ color: 'var(--text-muted)' }} className="text-xs">
                      {(file.size / 1024 / 1024).toFixed(2)} Mo
                    </p>
                  )}
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                />
                {file && (
                  <button
                    type="button"
                    className="text-xs transition-colors"
                    style={{ color: 'var(--error)' }}
                    onClick={(e) => { e.preventDefault(); setFile(null) }}
                  >
                    Supprimer
                  </button>
                )}
              </label>
            </div>

            <div style={{ color: 'var(--text-muted)' }} className="mt-4 flex items-center gap-2 text-xs">
              <Info className="h-3.5 w-3.5" />
              <span>Format accepté : PDF, JPG, PNG. Max 10 Mo.</span>
            </div>

            <div className="mt-5">
              <Button
                size="lg"
                className="w-full"
                disabled={!file || submitting}
                loading={submitting}
                onClick={handleSubmit}
              >
                <Upload className="h-4 w-4" />
                Soumettre pour vérification
              </Button>
            </div>
          </Card>
        )}

        <Card>
          <h3 style={{ color: 'var(--text-primary)' }} className="text-lg font-bold">Documents acceptés</h3>
          <div className="mt-4 space-y-3">
            {[
              { name: 'Passeport', desc: 'Pages avec photo et informations' },
              { name: 'Carte d\'identité nationale', desc: 'Recto et verso' },
              { name: 'Permis de conduire', desc: 'Recto et verso' },
            ].map((doc) => (
              <div
                key={doc.name}
                className="flex items-start gap-3 rounded-xl p-4"
                style={{ border: '1px solid var(--border-subtle)', background: 'var(--surface-secondary)' }}
              >
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}
                >
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <p style={{ color: 'var(--text-primary)' }} className="text-sm font-semibold">{doc.name}</p>
                  <p style={{ color: 'var(--text-muted)' }} className="text-xs">{doc.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-xl p-4" style={{ background: 'var(--accent-muted)' }}>
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" style={{ color: 'var(--accent)' }} />
              <div>
                <p style={{ color: 'var(--text-primary)' }} className="text-sm font-semibold">Important</p>
                <p style={{ color: 'var(--text-secondary)' }} className="mt-1 text-xs">
                  Assurez-vous que votre document est lisible, non expiré et que toutes les informations sont visibles.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}