import { useLocation } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout'
import { Card, EmptyState, TableRowSkeleton, Table, TableHeader, TableBody, TableRow, TableCell, TableHead, StatusBadge } from '@/components/common'
import { formatCurrency, formatDate } from '@/utils'
import { useAdminPayments } from '@/hooks'
import type { Payment } from '@/types'

const methodLabel: Record<string, string> = {
  CARD: 'Carte',
  BANK_TRANSFER: 'Virement',
  WALLET: 'Portefeuille',
}

export default function AdminPaymentsPage() {
  const location = useLocation()
  const { data, isLoading } = useAdminPayments()

  const payments: Payment[] = data?.results ?? []

  return (
    <DashboardLayout currentPath={location.pathname}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Gestion des Paiements</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Supervisez et auditez les flux de règlements entrants.</p>
        </div>
        <Card padding={false}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Référence</TableHead>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Méthode</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <TableRowSkeleton key={i} columns={6} />
                  ))
                : payments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-xs font-semibold text-[var(--text-muted)]">{p.reference}</TableCell>
                      <TableCell className="font-semibold text-[var(--text-primary)]">{p.user}</TableCell>
                      <TableCell className="font-bold text-[var(--text-primary)]">{formatCurrency(p.amount)}</TableCell>
                      <TableCell className="text-[var(--text-secondary)]">{methodLabel[p.method] ?? p.method}</TableCell>
                      <TableCell><StatusBadge status={p.status} /></TableCell>
                      <TableCell className="text-[var(--text-muted)]">{formatDate(p.created_at)}</TableCell>
                    </TableRow>
                  ))
              }
            </TableBody>
          </Table>
          {!isLoading && payments.length === 0 && <EmptyState title="Aucun paiement" />}
        </Card>
      </div>
    </DashboardLayout>
  )
}
