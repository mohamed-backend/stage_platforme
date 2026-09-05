import { useParams, useLocation, Link } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout'
import { usePayment, useConfirmPayment } from '@/hooks'
import { Card, Button, Badge, Skeleton, EmptyState } from '@/components/common'
import { formatCurrency, formatDateTime } from '@/utils'
import { useAuthStore } from '@/store'
import { ArrowLeft, CreditCard, CheckCircle, Clock, AlertTriangle } from 'lucide-react'

const methodLabels: Record<string, string> = {
  CARD: 'Carte bancaire',
  BANK_TRANSFER: 'Virement bancaire',
  WALLET: 'Portefeuille',
}

const statusConfig: Record<string, { label: string; badgeVariant: 'warning' | 'success' | 'default' | 'danger'; icon: React.ElementType }> = {
  PENDING: { label: 'En attente', badgeVariant: 'warning', icon: Clock },
  SUCCESS: { label: 'Réussi', badgeVariant: 'success', icon: CheckCircle },
  FAILED: { label: 'Échoué', badgeVariant: 'danger', icon: AlertTriangle },
  REFUNDED: { label: 'Remboursé', badgeVariant: 'default', icon: AlertTriangle },
}

export default function PaymentDetailPage() {
  const { id } = useParams()
  const location = useLocation()
  const { user } = useAuthStore()
  const { data: payment, isLoading, error } = usePayment(Number(id))
  const confirmPayment = useConfirmPayment()

  if (isLoading) {
    return (
      <DashboardLayout currentPath={location.pathname}>
        <div className="space-y-6 max-w-3xl">
          <Skeleton className="h-5 w-40" />
          <Card>
            <div className="space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-5 w-32" />
              <div className="grid grid-cols-2 gap-6 mt-6">
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
              </div>
              <div className="space-y-4 mt-6">
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
              </div>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !payment) {
    return (
      <DashboardLayout currentPath={location.pathname}>
        <div className="space-y-6 max-w-3xl">
          <Link
            to="/payments"
            className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux paiements
          </Link>
          <EmptyState title="Paiement introuvable" description="Ce paiement n'existe pas ou vous n'avez pas accès." />
        </div>
      </DashboardLayout>
    )
  }

  const status = statusConfig[payment.status] ?? statusConfig.PENDING
  const StatusIcon = status.icon
  const isOwner = payment.user === user?.id
  const canConfirm = payment.status === 'PENDING' && isOwner

  return (
    <DashboardLayout currentPath={location.pathname}>
      <div className="space-y-6 max-w-3xl">
        <Link
          to="/payments"
          className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux paiements
        </Link>

        <Card>
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 style={{ color: 'var(--text-primary)' }} className="text-2xl font-bold">
                Paiement {payment.reference}
              </h1>
              <p style={{ color: 'var(--text-secondary)' }} className="mt-1 text-sm">
                Détails du paiement
              </p>
            </div>
            <Badge variant={status.badgeVariant}>
              <StatusIcon className="mr-1 h-3 w-3" />
              {status.label}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="rounded-xl p-4" style={{ background: 'var(--surface-secondary)' }}>
              <div className="flex items-center gap-2 text-sm mb-1" style={{ color: 'var(--text-muted)' }}>
                <CreditCard className="h-4 w-4" />
                Montant
              </div>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {formatCurrency(payment.amount)}
              </p>
            </div>
            <div className="rounded-xl p-4" style={{ background: 'var(--surface-secondary)' }}>
              <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Méthode de paiement</p>
              <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                {methodLabels[payment.method] ?? payment.method}
              </p>
            </div>
          </div>

          <div className="space-y-0">
            {[
              { label: 'Statut', value: <Badge variant={status.badgeVariant}><StatusIcon className="mr-1 h-3 w-3" />{status.label}</Badge> },
              { label: 'Référence', value: <span className="font-mono font-medium" style={{ color: 'var(--text-primary)' }}>{payment.reference}</span> },
              { label: 'Date de création', value: <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{formatDateTime(payment.created_at)}</span> },
              ...(payment.confirmed_at ? [{ label: 'Date de confirmation', value: <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{formatDateTime(payment.confirmed_at)}</span> }] : []),
            ].map((row, i) => (
              <div
                key={i}
                className="flex justify-between items-center py-3"
                style={{ borderBottom: '1px solid var(--border-subtle)' }}
              >
                <span style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
                {row.value}
              </div>
            ))}
          </div>

          {canConfirm && (
            <div className="mt-6">
              <Button
                className="w-full"
                onClick={() => confirmPayment.mutate(payment.id)}
                disabled={confirmPayment.isPending}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {confirmPayment.isPending ? 'Confirmation en cours...' : 'Confirmer le paiement'}
              </Button>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
}
